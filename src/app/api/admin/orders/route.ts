import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ orders: [] });
  }

  const db = getSupabaseAdminClient();
  if (!db) {
    return NextResponse.json({ error: "Supabase is unavailable." }, { status: 500 });
  }

  const { data, error } = await db
    .from("orders")
    .select(
      "id,email,status,file_name,file_size_bytes,page_count,sender_name,sender_address_line1,sender_address_line2,sender_city,sender_state,sender_postal_code,recipient_name,recipient_address_line1,recipient_address_line2,recipient_city,recipient_state,recipient_postal_code,price_cents,proof_level,template_title,currency,stripe_checkout_session_id,lob_letter_id,created_at,paid_at,submitted_to_provider_at,mailed_at,delivered_at,failed_at,admin_notes",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders:
      data?.map((order) => ({
        id: order.id,
        email: order.email,
        status: order.status,
        fileName: order.file_name,
        fileSizeBytes: order.file_size_bytes,
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
        currency: order.currency,
        stripeCheckoutSessionId: order.stripe_checkout_session_id,
        lobLetterId: order.lob_letter_id,
        createdAt: order.created_at,
        paidAt: order.paid_at,
        submittedToProviderAt: order.submitted_to_provider_at,
        mailedAt: order.mailed_at,
        deliveredAt: order.delivered_at,
        failedAt: order.failed_at,
        adminNotes: order.admin_notes,
      })) ?? [],
  });
}
