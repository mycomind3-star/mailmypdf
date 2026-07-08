import JSZip from "jszip";
import type { ServerOrder } from "@/lib/orders";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

export type ProofPacketEvent = {
  eventType: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

function formatAddressLine(
  name: string | null,
  line1: string | null,
  line2: string | null,
  city: string | null,
  state: string | null,
  postalCode: string | null,
) {
  return [name, line1, line2, [city, state, postalCode].filter(Boolean).join(" ")]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join("\n");
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .trim();
}

function formatTimeline(events: ProofPacketEvent[]) {
  if (!events.length) {
    return "No order events were recorded.";
  }

  return events
    .map((event) => `${formatDateTime(event.createdAt)} | ${event.eventType} | ${event.message}`)
    .join("\n");
}

export async function buildProofPacketZip(order: ServerOrder, pdfBytes: Uint8Array, events: ProofPacketEvent[]) {
  const zip = new JSZip();
  const orderedEvents = [...events].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  zip.file("letter.pdf", pdfBytes);
  zip.file(
    "proof.json",
      JSON.stringify(
      {
        packetType: "proofpost-proof-packet",
        generatedAt: new Date().toISOString(),
        order: {
          id: order.id,
          status: order.status,
          fileName: order.file_name,
          fileSizeBytes: order.file_size_bytes,
          pageCount: order.page_count,
          priceCents: order.price_cents,
          proofLevel: order.proof_level,
          currency: order.currency,
          createdAt: order.created_at,
          paidAt: order.paid_at,
          submittedToProviderAt: order.submitted_to_provider_at,
          mailedAt: order.mailed_at,
          deliveredAt: order.delivered_at,
          failedAt: order.failed_at,
          sender: {
            name: order.sender_name,
            addressLine1: order.sender_address_line1,
            addressLine2: order.sender_address_line2,
            city: order.sender_city,
            state: order.sender_state,
            postalCode: order.sender_postal_code,
          },
          recipient: {
            name: order.recipient_name,
            addressLine1: order.recipient_address_line1,
            addressLine2: order.recipient_address_line2,
            city: order.recipient_city,
            state: order.recipient_state,
            postalCode: order.recipient_postal_code,
          },
          providerIds: {
            stripeCheckoutSessionId: order.stripe_checkout_session_id,
            stripePaymentIntentId: order.stripe_payment_intent_id,
            lobLetterId: order.lob_letter_id,
          },
          lobExpectedDeliveryDate: order.lob_expected_delivery_date,
        },
        timeline: orderedEvents.map((event) => ({
          eventType: event.eventType,
          message: event.message,
          createdAt: event.createdAt,
          metadata: event.metadata ?? {},
        })),
      },
      null,
      2,
    ),
  );
  zip.file("timeline.txt", formatTimeline(orderedEvents));
  zip.file(
    "receipt.txt",
    [
      "ProofPost Proof Packet Receipt",
      `Order ID: ${order.id}`,
      `Status: ${order.status}`,
      `Proof level: ${order.proof_level ?? "standard"}`,
      `Pages: ${order.page_count ?? 0}`,
      `Amount charged: ${formatMoney(order.price_cents ?? 0)}`,
      `Created: ${formatDate(order.created_at)}`,
      `Paid: ${order.paid_at ? formatDateTime(order.paid_at) : "Not paid yet"}`,
      `Provider submission: ${order.submitted_to_provider_at ? formatDateTime(order.submitted_to_provider_at) : "Not submitted yet"}`,
      `Lob letter ID: ${order.lob_letter_id ?? "—"}`,
    ].join("\n"),
  );
  zip.file(
    "notes.txt",
    [
      "This proof packet bundles the uploaded PDF, the payment receipt, and the order timeline.",
      "PDFs remain private in server-managed storage.",
      `Sender: ${formatAddressLine(
        order.sender_name,
        order.sender_address_line1,
        order.sender_address_line2,
        order.sender_city,
        order.sender_state,
        order.sender_postal_code,
      )}`,
      `Recipient: ${formatAddressLine(
        order.recipient_name,
        order.recipient_address_line1,
        order.recipient_address_line2,
        order.recipient_city,
        order.recipient_state,
        order.recipient_postal_code,
      )}`,
      `Mail partner expected delivery: ${order.lob_expected_delivery_date ? formatDate(order.lob_expected_delivery_date) : "Not available yet"}`,
      `Packet reference: ${normalizeText(order.id)}`,
    ].join("\n\n"),
  );

  return zip.generateAsync({ type: "uint8array" });
}
