import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { findOrderById, findOrderByLookupToken, updateOrder, addOrderEvent } from "@/lib/orders";
import { hasStripeEnv, getAppUrl } from "@/lib/env";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderId?: string; lookupToken?: string };
  if (!body.orderId) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  if (hasStripeEnv()) {
    const stripe = getStripeClient();
    const order = body.lookupToken
      ? await findOrderByLookupToken(body.orderId, body.lookupToken)
      : await findOrderById(body.orderId);
    if (!stripe || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${getAppUrl()}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}&token=${order.public_lookup_token}`,
      cancel_url: `${getAppUrl()}/cancel`,
      customer_email: order.email,
      line_items: [
        {
          price_data: {
            currency: order.currency ?? "usd",
            product_data: {
              name: "ProofPost letter",
              description: `${order.page_count ?? 0} pages`,
            },
            unit_amount: order.price_cents ?? 499,
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        lookup_token: order.public_lookup_token,
      },
    });

    await updateOrder(order.id, {
      stripe_checkout_session_id: session.id,
      status: "checkout_created",
    });
    await addOrderEvent(order.id, "checkout.created", "Stripe Checkout session created.");

    return NextResponse.json({ checkoutUrl: session.url });
  }

  return NextResponse.json({
    checkoutUrl: `https://checkout.stripe.com/pay/cs_test_${crypto.randomUUID().replaceAll("-", "")}`,
  });
}
