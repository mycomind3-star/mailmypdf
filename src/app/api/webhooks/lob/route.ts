import { NextResponse } from "next/server";
import { handleLobWebhook } from "@/lib/lob-webhook";
import { getAppUrl } from "@/lib/env";
import { addOrderEvent, sendOrderEmail } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const result = await handleLobWebhook(request);

    if ("mailed" in result && result.mailed && result.order) {
      try {
        await sendOrderEmail(
          result.order.email,
          "Your letter has been mailed",
          `<p>Your letter has been mailed.</p><p>Order link: <a href="${getAppUrl()}/orders/${result.order.id}?token=${result.order.public_lookup_token}">${getAppUrl()}/orders/${result.order.id}?token=${result.order.public_lookup_token}</a></p>`,
        );
      } catch (error) {
        await addOrderEvent(result.order.id, "email.mailed_failed", "Mailed confirmation email failed to send.", {
          error: error instanceof Error ? error.message : "Unknown Resend error",
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Lob webhook." },
      { status: 400 },
    );
  }
}
