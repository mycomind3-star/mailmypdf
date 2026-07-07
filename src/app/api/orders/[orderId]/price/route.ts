import { NextResponse } from "next/server";
import { calculateLetterPrice } from "@/lib/pricing";
import { calculateAndLockPrice, findOrderById } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const body = (await request.json().catch(() => ({}))) as { pageCount?: number };
  const pageCount = body.pageCount ?? 0;

  try {
    const priceCents = calculateLetterPrice(pageCount);

    if (hasSupabaseEnv()) {
      const order = await findOrderById(orderId);
      if (order) {
        await calculateAndLockPrice(orderId, pageCount);
      }
    }

    return NextResponse.json({ orderId, priceCents, currency: "usd", pageCount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to price order." },
      { status: 400 },
    );
  }
}
