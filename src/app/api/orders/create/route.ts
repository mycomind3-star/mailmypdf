import { NextResponse } from "next/server";
import { addOrderEvent, createDraftOrder } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";
import { normalizeProofLevel } from "@/lib/proof-levels";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; proofLevel?: unknown };
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const proofLevel = normalizeProofLevel(body.proofLevel);

  if (hasSupabaseEnv()) {
    const order = await createDraftOrder(body.email, proofLevel);
    if (order) {
      await addOrderEvent(order.id, "order.created", "Draft order created.", { proof_level: proofLevel });
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
