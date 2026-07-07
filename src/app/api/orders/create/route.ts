import { NextResponse } from "next/server";
import { addOrderEvent, createDraftOrder } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (hasSupabaseEnv()) {
    const order = await createDraftOrder(body.email);
    if (order) {
      await addOrderEvent(order.id, "order.created", "Draft order created.");
      return NextResponse.json({
        orderId: order.id,
        lookupToken: order.public_lookup_token,
      });
    }
  }

  return NextResponse.json({
    orderId: crypto.randomUUID(),
    lookupToken: crypto.randomUUID().replaceAll("-", ""),
  });
}
