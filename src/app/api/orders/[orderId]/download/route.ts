import { NextResponse } from "next/server";
import { createOrderPdfSignedUrl } from "@/lib/storage";
import { findOrderByLookupToken } from "@/lib/orders";
import { hasSupabaseEnv } from "@/lib/env";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (hasSupabaseEnv()) {
    const order = token ? await findOrderByLookupToken(orderId, token) : null;
    if (order) {
      const signedUrl = await createOrderPdfSignedUrl(orderId);
      if (signedUrl) {
        return NextResponse.json({ orderId, downloadUrl: signedUrl });
      }
    }
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ orderId, downloadUrl: "/api/downloads/mock.pdf" });
}
