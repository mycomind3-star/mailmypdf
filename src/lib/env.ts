import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const optionalString = z.string().optional().or(z.literal(""));

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  LOB_API_KEY: optionalString,
  LOB_WEBHOOK_SECRET: optionalString,
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: optionalString,
  ADMIN_EMAIL: optionalString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  cachedEnv ??= serverEnvSchema.parse(process.env);
  return cachedEnv;
}

export function hasSupabaseEnv() {
  const env = getEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasStripeEnv() {
  return Boolean(getEnv().STRIPE_SECRET_KEY);
}

export function hasLobEnv() {
  return Boolean(getEnv().LOB_API_KEY);
}

export function hasResendEnv() {
  return Boolean(getEnv().RESEND_API_KEY && getEnv().RESEND_FROM_EMAIL);
}

export function getAppUrl() {
  return getEnv().NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getResendFromEmail() {
  return getEnv().RESEND_FROM_EMAIL || "MailMyPDF <onboarding@resend.dev>";
}
