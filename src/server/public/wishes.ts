import "server-only";

import { getSessionId } from "@/lib/analytics/session";
import { isPackageKey, PACKAGE_DEFINITIONS } from "@/lib/packages/entitlements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { publicWishSchema, TURNSTILE_PENDING_MESSAGE } from "@/lib/validation/public-wish";
import { trackEvent } from "./analytics";

export interface SubmitWishResult {
  ok: boolean;
  error?: string;
}

const WISH_UNAVAILABLE_MESSAGE = "Ucapan tidak tersedia untuk undangan ini.";

export async function submitWish(input: unknown): Promise<SubmitWishResult> {
  const parsed = publicWishSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { invitationId, guestToken, guestName, message, turnstileToken } = parsed.data;

  const supabase = createSupabaseAdminClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, status, package_key, settings, is_demo")
    .eq("id", invitationId)
    .maybeSingle();

  // Demos show the real confirmation so visitors see the full experience,
  // but nothing is written.
  if (invitation?.is_demo) return { ok: true };

  if (!turnstileToken) {
    return { ok: false, error: TURNSTILE_PENDING_MESSAGE };
  }

  const verified = await verifyTurnstileToken(turnstileToken);
  if (!verified) {
    return { ok: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  if (!invitation || invitation.status !== "published") {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  const settings = invitation.settings as { features?: { wishes?: unknown } } | null;
  if (!isPackageKey(invitation.package_key) ||
      !PACKAGE_DEFINITIONS[invitation.package_key].invitationFeatures.wishes ||
      settings?.features?.wishes !== true) {
    return { ok: false, error: WISH_UNAVAILABLE_MESSAGE };
  }

  let guestId: string | null = null;
  let resolvedGuestName = guestName ? sanitizePlainText(guestName) : null;

  if (guestToken) {
    const { data: guest } = await supabase
      .from("guests")
      .select("id, display_name")
      .eq("invitation_id", invitationId)
      .eq("token", guestToken)
      .maybeSingle();

    if (guest) {
      guestId = guest.id;
      resolvedGuestName = guest.display_name;
    }
  }

  if (!resolvedGuestName) {
    return { ok: false, error: "Nama wajib diisi." };
  }

  const sanitizedMessage = sanitizePlainText(message);

  if (!sanitizedMessage) {
    return { ok: false, error: "Ucapan tidak boleh kosong." };
  }

  const { error } = await supabase.from("wishes").insert({
    invitation_id: invitationId,
    guest_id: guestId,
    guest_name: resolvedGuestName,
    message: sanitizedMessage,
    is_visible: true,
  });

  if (error) {
    if (error.code === "P0001" && error.message === WISH_UNAVAILABLE_MESSAGE) {
      return { ok: false, error: WISH_UNAVAILABLE_MESSAGE };
    }
    return { ok: false, error: "Gagal mengirim ucapan. Coba lagi." };
  }

  // Message content is intentionally never stored in analytics metadata.
  await trackEvent({
    invitationId,
    eventType: "wish_submitted",
    sessionId: await getSessionId(),
    guestId,
  });

  return { ok: true };
}
