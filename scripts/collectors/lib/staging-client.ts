/**
 * Node-only, service-role Supabase client for collector/promotion scripts.
 * Bypasses Row Level Security by design — never import this from src/app or
 * src/components, and never expose SUPABASE_SERVICE_ROLE_KEY with a
 * NEXT_PUBLIC_ prefix.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { requireEnv } from "@/lib/require-env";

export function createStagingClient() {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
}
