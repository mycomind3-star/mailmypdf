import { Resend } from "resend";
import { getEnv, hasResendEnv } from "@/lib/env";

let resend: Resend | null = null;

export function getResendClient() {
  if (!hasResendEnv()) {
    return null;
  }

  if (!resend) {
    resend = new Resend(getEnv().RESEND_API_KEY!);
  }

  return resend;
}

