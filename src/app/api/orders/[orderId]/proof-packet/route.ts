import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { findOrderByLookupToken, listOrderEvents } from "@/lib/orders";
import { createOrderPdfSignedUrl } from "@/lib/storage";
import { buildProofPacketZip, type ProofPacketEvent } from "@/lib/proof-packet";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Proof packets are only available in live mode." }, { status: 404 });
  }

  if (!token) {
    return NextResponse.json({ error: "A secure token is required." }, { status: 400 });
  }

  const order = await findOrderByLookupToken(orderId, token);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!order.paid_at) {
    return NextResponse.json({ error: "Proof packet is available after payment." }, { status: 409 });
  }

  const signedUrl = await createOrderPdfSignedUrl(orderId);
  if (!signedUrl) {
    return NextResponse.json({ error: "Unable to access the uploaded PDF." }, { status: 500 });
  }

  const response = await fetch(signedUrl, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ error: "Unable to load the uploaded PDF." }, { status: 502 });
  }

  const events = (await listOrderEvents(orderId)).map((event) => ({
    eventType: event.eventType,
    message: event.message,
    createdAt: event.createdAt,
    metadata: event.metadata as Record<string, unknown>,
  })) as ProofPacketEvent[];

  const proofZip = await buildProofPacketZip(order, new Uint8Array(await response.arrayBuffer()), events);
  const fileName = `mailmypdf-proof-${orderId}.zip`;

  return new NextResponse(Buffer.from(proofZip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
