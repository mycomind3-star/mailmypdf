import { NextResponse } from "next/server";
import { findOrderByLookupToken, listOrderEvents } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";
import { createOrderPdfSignedUrl } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (hasSupabaseEnv()) {
    const order = token ? await findOrderByLookupToken(orderId, token) : null;
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      fileName: order.file_name,
      pageCount: order.page_count,
      senderName: order.sender_name,
      senderAddressLine1: order.sender_address_line1,
      senderAddressLine2: order.sender_address_line2,
      senderCity: order.sender_city,
      senderState: order.sender_state,
      senderPostalCode: order.sender_postal_code,
      recipientName: order.recipient_name,
      recipientAddressLine1: order.recipient_address_line1,
      recipientAddressLine2: order.recipient_address_line2,
      recipientCity: order.recipient_city,
      recipientState: order.recipient_state,
      recipientPostalCode: order.recipient_postal_code,
      priceCents: order.price_cents,
      proofLevel: order.proof_level,
      templateTitle: order.template_title,
      mailProvider: order.mail_provider,
      providerLetterId: order.provider_letter_id,
      providerTrackingNumber: order.provider_tracking_number,
      providerExpectedDeliveryDate: order.provider_expected_delivery_date,
      providerTrackingEvents: Array.isArray(order.provider_tracking_events) ? order.provider_tracking_events : [],
      addressVerificationStatus: order.address_verification_status,
      addressVerificationRaw: order.address_verification_raw,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      submittedToProviderAt: order.submitted_to_provider_at,
      mailedAt: order.mailed_at,
      deliveredAt: order.delivered_at,
      failedAt: order.failed_at,
      lobExpectedDeliveryDate: order.lob_expected_delivery_date,
      lobTrackingEvents: Array.isArray(order.lob_tracking_events) ? order.lob_tracking_events : [],
      downloadUrl: await createOrderPdfSignedUrl(orderId).catch(() => null),
      events: await listOrderEvents(orderId),
    });
  }

    return NextResponse.json({
      id: orderId,
      status: "provider_processing",
      fileName: "document.pdf",
      pageCount: 3,
    recipientName: "Jane Doe",
    recipientCity: "San Francisco",
    recipientState: "CA",
    priceCents: 699,
      proofLevel: "proof",
      templateTitle: "Client payment reminder",
      mailProvider: "lob",
      providerLetterId: "ltr_demo_456",
      providerTrackingNumber: "9400 0000 0000 0000 0000 00",
      providerExpectedDeliveryDate: null,
      providerTrackingEvents: [],
      addressVerificationStatus: "deliverable",
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      submittedToProviderAt: null,
      mailedAt: null,
      deliveredAt: null,
      failedAt: null,
      lobExpectedDeliveryDate: null,
      lobTrackingEvents: [],
      downloadUrl: null,
      events: [
      {
        eventType: "payment.received",
        message: "Payment received.",
        createdAt: new Date().toISOString(),
      },
    ],
  });
}
