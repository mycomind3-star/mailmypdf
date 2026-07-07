import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import {
  addOrderEvent,
  findOrderById,
  recordPayment,
  recordWebhookEvent,
  sendOrderEmail,
  submitOrderToLob,
  updateOrder,
} from "@/lib/orders";
import { getAppUrl, hasStripeEnv, shouldAutoSubmitToLob } from "@/lib/env";

export async function POST(request: Request) {
  if (!hasStripeEnv()) {
    const payload = await request.text();
    return NextResponse.json({
      received: true,
      provider: "stripe",
      bytes: payload.length,
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is unavailable." }, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Missing Stripe webhook secret." }, { status: 500 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  const stored = await recordWebhookEvent("stripe", event.id, event.type, event);
  if (!stored) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = String(session.metadata?.order_id ?? "");
    const order = orderId ? await findOrderById(orderId) : null;

    if (order) {
      await updateOrder(order.id, {
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent ? String(session.payment_intent) : null,
      });
      await recordPayment(
        order.id,
        session.amount_total ?? order.price_cents ?? 0,
        session.currency ?? order.currency ?? "usd",
        "completed",
        { stripe_event_id: event.id, session_id: session.id },
      );
      await addOrderEvent(order.id, "payment.received", "Payment received.");
      try {
        await sendOrderEmail(
          order.email,
          "We received your MailMyPDF order",
          `<p>Payment received.</p><p>Your order link: <a href="${getAppUrl()}/orders/${order.id}?token=${order.public_lookup_token}">${getAppUrl()}/orders/${order.id}?token=${order.public_lookup_token}</a></p>`,
        );
      } catch (error) {
        await addOrderEvent(order.id, "email.payment_confirmation_failed", "Payment confirmation email failed to send.", {
          error: error instanceof Error ? error.message : "Unknown Resend error",
        });
      }

      if (shouldAutoSubmitToLob()) {
        try {
          await submitOrderToLob(order.id);
        } catch (error) {
          await updateOrder(order.id, {
            status: "failed_provider_submission",
            failed_at: new Date().toISOString(),
          });
          await addOrderEvent(order.id, "provider.failed_submission", "Lob submission failed.", {
            error: error instanceof Error ? error.message : "Unknown Lob submission error",
          });
        }
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = String(session.metadata?.order_id ?? "");
    if (orderId) {
      await updateOrder(orderId, { status: "failed_payment" });
      await addOrderEvent(orderId, "payment.expired", "Stripe Checkout session expired.");
    }
  }

  return NextResponse.json({ received: true });
}
