import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Server-side verification. Never trust a Turnstile token without this. */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing required environment variable: TURNSTILE_SECRET_KEY");
  }

  if (!token) {
    return false;
  }

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success: boolean };
  return result.success;
}
