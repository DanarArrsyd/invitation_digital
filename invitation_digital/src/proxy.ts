import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const SESSION_COOKIE = "session_id";

/**
 * Refreshes the Supabase auth session cookie on every request so
 * Server Components always see an up-to-date session. Also ensures a
 * lightweight anonymous session_id cookie exists — used only to dedupe
 * "unique visitor" counts on the public invitation analytics, never for
 * fingerprinting or personal data.
 */
export async function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE)) {
    request.cookies.set(SESSION_COOKIE, crypto.randomUUID());
  }

  const response = NextResponse.next({ request });
  response.cookies.set(SESSION_COOKIE, request.cookies.get(SESSION_COOKIE)!.value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
