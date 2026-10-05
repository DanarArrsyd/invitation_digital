const MEDIA_PATH = "/storage/v1/object/public/invitation-media/";

function supabaseUrl(): string | null {
  try {
    // Literal access so Next inlines it into the client bundle.
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  } catch {
    return null; // no `process` (plain Node/VM test harnesses)
  }
}

/**
 * Whether next/image may resize this source: app files (`/demo/...`) and
 * uploads in the invitation media bucket (the next.config remote pattern).
 * Anything else is passed through untouched, since the optimizer would
 * refuse an unlisted host.
 */
export function isOptimizableImage(src: string): boolean {
  if (src.startsWith("/")) return !src.startsWith("//");
  const base = supabaseUrl();
  return base !== null && src.startsWith(`${base}${MEDIA_PATH}`);
}
