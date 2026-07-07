import Stripe from "stripe";
import { getEnv, hasStripeEnv } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripeClient() {
  if (!hasStripeEnv()) {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(getEnv().STRIPE_SECRET_KEY!, {
    });
  }

  return stripe;
}
