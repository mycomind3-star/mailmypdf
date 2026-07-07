import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateLetterPrice } from "@/lib/pricing";
import { getMailProvider } from "@/lib/lob";
import { getResendClient } from "@/lib/resend";
import { getAppUrl, getResendFromEmail } from "@/lib/env";
import { createOrderPdfSignedUrl } from "@/lib/storage";

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
  currency: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  lob_letter_id: string | null;
  lob_expected_delivery_date: string | null;
  lob_tracking_events: unknown;
  lob_raw_response: unknown;
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

export async function createDraftOrder(email: string) {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("orders").insert({ email, status: "draft" }).select("*").single();
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

  const signedPdf = (await createOrderPdfSignedUrl(orderId)) ?? `${getAppUrl()}/api/orders/${orderId}/download`;
  const result = await provider.createLetter({
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
    metadata: { order_id: orderId },
  });

  const rawResponse = result.raw as Record<string, unknown>;
  const expectedDeliveryDate =
    typeof rawResponse?.expected_delivery_date === "string"
      ? rawResponse.expected_delivery_date
      : typeof rawResponse?.target_delivery_date === "string"
        ? rawResponse.target_delivery_date
        : null;

  await updateOrder(orderId, {
    lob_letter_id: result.id,
    lob_raw_response: result.raw,
    lob_expected_delivery_date: expectedDeliveryDate,
    submitted_to_provider_at: new Date().toISOString(),
    status: "provider_processing",
  });
  await addOrderEvent(orderId, "provider.submitted", "Order submitted to mail partner.", { lob_letter_id: result.id });

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
