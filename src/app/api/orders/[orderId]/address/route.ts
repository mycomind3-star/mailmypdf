import { NextResponse } from "next/server";
import { addOrderEvent, findOrderById, findOrderByLookupToken, updateOrder } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";

function isState(value: string) {
  return /^[A-Z]{2}$/.test(value);
}

function isZip(value: string) {
  return /^\d{5}(-\d{4})?$/.test(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    lookupToken?: string;
    sender?: { country?: string; state?: string; postalCode?: string };
    recipient?: { country?: string; state?: string; postalCode?: string };
    senderName?: string;
    senderLine1?: string;
    senderLine2?: string;
    senderCity?: string;
    recipientName?: string;
    recipientLine1?: string;
    recipientLine2?: string;
    recipientCity?: string;
  };

  if (body.sender?.country !== "US" || body.recipient?.country !== "US") {
    return NextResponse.json({ error: "U.S. domestic mail only." }, { status: 400 });
  }

  if (!isState(body.sender?.state ?? "") || !isState(body.recipient?.state ?? "")) {
    return NextResponse.json({ error: "Invalid U.S. state code." }, { status: 400 });
  }

  if (!isZip(body.sender?.postalCode ?? "") || !isZip(body.recipient?.postalCode ?? "")) {
    return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 });
  }

  if (hasSupabaseEnv()) {
    const order = body.lookupToken
      ? await findOrderByLookupToken(orderId, body.lookupToken)
      : await findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await updateOrder(orderId, {
      sender_name: body.senderName ?? order.sender_name,
      sender_address_line1: body.senderLine1 ?? order.sender_address_line1,
      sender_address_line2: body.senderLine2 ?? order.sender_address_line2,
      sender_city: body.senderCity ?? order.sender_city,
      sender_state: body.sender?.state ?? order.sender_state,
      sender_postal_code: body.sender?.postalCode ?? order.sender_postal_code,
      recipient_name: body.recipientName ?? order.recipient_name,
      recipient_address_line1: body.recipientLine1 ?? order.recipient_address_line1,
      recipient_address_line2: body.recipientLine2 ?? order.recipient_address_line2,
      recipient_city: body.recipientCity ?? order.recipient_city,
      recipient_state: body.recipient?.state ?? order.recipient_state,
      recipient_postal_code: body.recipient?.postalCode ?? order.recipient_postal_code,
    });
    await addOrderEvent(orderId, "addresses.saved", "Sender and recipient addresses were saved.");
  }

  return NextResponse.json({ orderId, ok: true });
}
