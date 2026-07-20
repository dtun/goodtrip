import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@goodtrip/shared";

export type GoodtripClient = SupabaseClient<Database>;

let client: GoodtripClient | null = null;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name} — see apps/web/.env.example`);
  }
  return value;
}

/** Browser-side Supabase client; the anonymous session persists in localStorage. */
export function getSupabase(): GoodtripClient {
  if (!client) {
    client = createClient<Database>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    );
  }
  return client;
}

/** The single hardcoded trip of the DC 2026 beta (spec section 13). */
export function getTripId(): string {
  return requireEnv("NEXT_PUBLIC_GOODTRIP_TRIP_ID", process.env.NEXT_PUBLIC_GOODTRIP_TRIP_ID);
}
