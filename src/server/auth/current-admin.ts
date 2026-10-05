import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentAdmin = { id: string; email: string | null };

/**
 * The signed-in admin for this request, or null. Wrapped in React `cache`
 * so the auth gate, the shell and the page share one check per request
 * instead of each asking Supabase Auth again. `getClaims` verifies the
 * session JWT (locally when the project uses asymmetric signing keys).
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  return { id: data.claims.sub, email };
});
