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
      createdAt: order.created_at,
      paidAt: order.paid_at,
      submittedToProviderAt: order.submitted_to_provider_at,
      mailedAt: order.mailed_at,
      lobExpectedDeliveryDate: order.lob_expected_delivery_date,
      lobTrackingEvents: order.lob_tracking_events,
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
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    submittedToProviderAt: null,
    mailedAt: null,
    lobExpectedDeliveryDate: null,
    lobTrackingEvents: [],
      events: [
      {
        eventType: "payment.received",
        message: "Payment received.",
        createdAt: new Date().toISOString(),
      },
    ],
  });
}
