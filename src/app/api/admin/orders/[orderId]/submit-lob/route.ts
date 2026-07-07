import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { submitOrderToLob } from "@/lib/orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is unavailable." }, { status: 400 });
  }

  try {
    const lobLetterId = await submitOrderToLob(orderId);
    return NextResponse.json({ orderId, lobLetterId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit to Lob." },
      { status: 400 },
    );
  }
}
