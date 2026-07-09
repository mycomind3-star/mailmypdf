import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLetterPrice } from "@/lib/pricing";
import { getMailProvider, verifyAddressWithLob } from "@/lib/lob";
import { getResendClient } from "@/lib/resend";
import { getAppUrl, getLobMode, getResendFromEmail, isLobTestMode } from "@/lib/env";
import { createOrderPdfSignedUrl } from "@/lib/storage";
import { normalizeProofLevel } from "@/lib/proof-levels";

export type ServerOrder = {
  id: string;
  email: string;
  status: string;
  file_name: string | null;
  file_size_bytes: number | null;
  page_count: number | null;
  sender_name: string | null;
  sender_address_line1: string | null;
  sender_address_line2: string | null;
  sender_city: string | null;
  sender_state: string | null;
  sender_postal_code: string | null;
  recipient_name: string | null;
  recipient_address_line1: string | null;
  recipient_address_line2: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  recipient_postal_code: string | null;
  price_cents: number | null;
  proof_level: string | null;
  template_title: string | null;
  currency: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  lob_letter_id: string | null;
  lob_expected_delivery_date: string | null;
  lob_tracking_events: unknown;
  lob_raw_response: unknown;
  mail_provider: string | null;
  provider_letter_id: string | null;
  provider_tracking_number: string | null;
  provider_expected_delivery_date: string | null;
  provider_tracking_events: unknown;
  provider_raw_response: unknown;
  address_verification_status: string | null;
  address_verification_raw: unknown;
  upload_path: string | null;
  final_pdf_path: string | null;
  public_lookup_token: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  submitted_to_provider_at: string | null;
  mailed_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
};

export async function findOrderById(id: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ServerOrder | null;
}

export async function findOrderByLookupToken(id: string, token: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("public_lookup_token", token)
    .maybeSingle();
  if (error) throw error;
  return data as ServerOrder | null;
}

export async function findOrderByLobLetterId(lobLetterId: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("orders").select("*").eq("lob_letter_id", lobLetterId).maybeSingle();
  if (error) throw error;
  return data as ServerOrder | null;
}

export async function findOrderByProviderLetterId(providerLetterId: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("orders").select("*").eq("provider_letter_id", providerLetterId).maybeSingle();
  if (error) throw error;
  return data as ServerOrder | null;
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function getTrackingEvents(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export async function createDraftOrder(email: string, proofLevel: string = "standard", templateTitle: string | null = null) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .insert({
      email,
      status: "draft",
      proof_level: normalizeProofLevel(proofLevel),
      template_title: templateTitle,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ServerOrder;
}

export async function updateOrder(id: string, patch: Record<string, unknown>) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("orders").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ServerOrder;
}

export async function addOrderEvent(
  orderId: string,
  eventType: string,
  message: string,
  metadata: Record<string, unknown> = {},
) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  await db.from("order_events").insert({ order_id: orderId, event_type: eventType, message, metadata });
}

export async function listOrderEvents(orderId: string) {
  const db = getSupabaseAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from("order_events")
    .select("event_type, message, metadata, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((event) => ({
    eventType: event.event_type,
    message: event.message ?? "",
    createdAt: event.created_at,
    metadata: event.metadata ?? {},
  }));
}

export async function recordWebhookEvent(
  provider: string,
  providerEventId: string | null | undefined,
  eventType: string,
  payload: unknown,
) {
  const db = getSupabaseAdminClient();
  if (!db) return false;

  const { error } = await db.from("webhook_events").insert({
    provider,
    provider_event_id: providerEventId ?? null,
    event_type: eventType,
    payload,
  });

  if (error) {
    if ((error as { code?: string }).code === "23505" || String(error.message).toLowerCase().includes("duplicate")) {
      return false;
    }
    throw error;
  }

  return true;
}

export async function recordPayment(
  orderId: string,
  amountCents: number,
  currency: string,
  status: string,
  metadata: Record<string, unknown> = {},
) {
  const db = getSupabaseAdminClient();
  if (!db) return null;

  const { data, error } = await db
    .from("payments")
    .insert({
      order_id: orderId,
      amount_cents: amountCents,
      currency,
      status,
      raw_event: metadata,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function calculateAndLockPrice(orderId: string, pageCount: number) {
  const priceCents = calculateLetterPrice(pageCount);
  await updateOrder(orderId, { price_cents: priceCents, status: "priced" });
  await addOrderEvent(orderId, "order.priced", "Price calculated and locked.", { price_cents: priceCents });
  return priceCents;
}

export async function submitOrderToLob(orderId: string) {
  const db = getSupabaseAdminClient();
  const provider = getMailProvider();
  if (!db || !provider) return null;

  const order = await findOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (!["paid", "failed_provider_submission"].includes(order.status)) {
    throw new Error("Order is not ready for Lob submission");
  }
  if (order.lob_letter_id) return order.lob_letter_id;
  if (order.provider_letter_id) {
    await updateOrder(orderId, {
      lob_letter_id: order.provider_letter_id,
      mail_provider: order.mail_provider ?? "lob",
    });
    return order.provider_letter_id;
  }

  const recipientVerification = await verifyAddressWithLob({
    primaryLine: order.recipient_address_line1!,
    city: order.recipient_city!,
    state: order.recipient_state!,
    zipCode: order.recipient_postal_code!,
  });
  const verificationStatus = recipientVerification.status.toLowerCase();
  const isDeliverable =
    verificationStatus.includes("deliver") ||
    verificationStatus.includes("valid") ||
    verificationStatus.includes("verified") ||
    verificationStatus.includes("unknown");

  await updateOrder(orderId, {
    address_verification_status: recipientVerification.status,
    address_verification_raw: recipientVerification.raw,
  });
  await addOrderEvent(orderId, "provider.address_verified", "Recipient address verification completed.", {
    status: recipientVerification.status,
    lob_mode: getLobMode(),
  });

  if (!isDeliverable && !isLobTestMode()) {
    await updateOrder(orderId, {
      status: "failed_provider_submission",
      failed_at: new Date().toISOString(),
    });
    await addOrderEvent(orderId, "provider.address_verification_failed", "Mail partner rejected the recipient address.", {
      status: recipientVerification.status,
    });
    throw new Error("Recipient address could not be verified by Lob.");
  }

  const signedPdf = (await createOrderPdfSignedUrl(orderId)) ?? `${getAppUrl()}/api/orders/${orderId}/download`;
  let result;
  try {
    result = await provider.createLetter({
      to: {
        name: order.recipient_name!,
        address_line1: order.recipient_address_line1!,
        address_line2: order.recipient_address_line2 ?? undefined,
        address_city: order.recipient_city!,
        address_state: order.recipient_state!,
        address_zip: order.recipient_postal_code!,
        address_country: "US",
      },
      from: {
        name: order.sender_name!,
        address_line1: order.sender_address_line1!,
        address_line2: order.sender_address_line2 ?? undefined,
        address_city: order.sender_city!,
        address_state: order.sender_state!,
        address_zip: order.sender_postal_code!,
        address_country: "US",
      },
      file: signedPdf,
      metadata: {
        order_id: orderId,
        proof_level: normalizeProofLevel(order.proof_level),
        template_title: String(order.template_title ?? ""),
      },
    });
  } catch (error) {
    await updateOrder(orderId, {
      status: "failed_provider_submission",
      failed_at: new Date().toISOString(),
    });
    await addOrderEvent(orderId, "provider.failed_submission", "Lob submission failed.", {
      error: error instanceof Error ? error.message : "Unknown Lob submission error",
    });
    throw error;
  }

  const rawResponse = result.raw as Record<string, unknown>;
  const expectedDeliveryDate =
    typeof rawResponse?.expected_delivery_date === "string"
      ? rawResponse.expected_delivery_date
      : typeof rawResponse?.target_delivery_date === "string"
        ? rawResponse.target_delivery_date
        : null;
  const trackingNumber =
    getStringValue(rawResponse?.tracking_number) ??
    getStringValue(rawResponse?.trackingNumber);
  const trackingEvents = getTrackingEvents(rawResponse?.tracking_events ?? rawResponse?.trackingEvents);

  await updateOrder(orderId, {
    mail_provider: "lob",
    provider_letter_id: result.id,
    provider_tracking_number: trackingNumber,
    provider_expected_delivery_date: expectedDeliveryDate,
    provider_tracking_events: trackingEvents,
    provider_raw_response: result.raw,
    lob_letter_id: result.id,
    lob_raw_response: result.raw,
    lob_expected_delivery_date: expectedDeliveryDate,
    submitted_to_provider_at: new Date().toISOString(),
    status: "provider_processing",
    failed_at: null,
  });
  await addOrderEvent(orderId, "provider.submitted", "Order submitted to mail partner.", {
    lob_letter_id: result.id,
    verification_status: recipientVerification.status,
    lob_mode: getLobMode(),
  });

  return result.id;
}

export async function sendOrderEmail(
  to: string,
  subject: string,
  html: string,
) {
  const resend = getResendClient();
  if (!resend) return false;

  await resend.emails.send({
    from: getResendFromEmail(),
    to,
    subject,
    html,
  });

  return true;
}
