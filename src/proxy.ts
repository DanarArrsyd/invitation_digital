import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const SESSION_COOKIE = "session_id";

/**
 * Two jobs, each only where it is needed so public pages never wait on
 * Supabase Auth:
 *
 * - /admin: refresh the Supabase auth session cookie so Server Components
 *   see an up-to-date session.
 * - Public invitations: ensure a lightweight anonymous session_id cookie
 *   exists, used only to dedupe "unique visitor" counts on the invitation
 *   analytics, never for fingerprinting or personal data.
 *
 * The marketing pages (landing, catalogue, demos) need neither: the
 * matcher skips them, and the landing page returns straight away.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return refreshAdminSession(request);
  }

  return ensureSessionCookie(request);
}

function ensureSessionCookie(request: NextRequest) {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const sessionId = crypto.randomUUID();
  request.cookies.set(SESSION_COOKIE, sessionId);
  const response = NextResponse.next({ request });
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Verifies the JWT and refreshes it when it has expired. With asymmetric
  // signing keys this is a local check instead of an Auth server roundtrip.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|opengraph-image|sitemap.xml|robots.txt|template(?:/|$)|demo(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
