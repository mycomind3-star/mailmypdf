import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv, hasSupabaseEnv } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!adminClient) {
    const env = getEnv();
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

