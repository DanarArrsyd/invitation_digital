import { cookies } from "next/headers";

const SESSION_COOKIE = "session_id";

/**
 * Reads the anonymous session_id cookie set by proxy.ts. Server Components
 * can't set cookies mid-render, so this only reads — middleware is the sole
 * writer. Falls back to a one-off id on the rare request that predates the
 * cookie (e.g. local dev before middleware ran), rather than failing.
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? crypto.randomUUID();
}
