import "server-only";

import { getSessionId } from "@/lib/analytics/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { publicWishSchema } from "@/lib/validation/public-wish";
import { trackEvent } from "./analytics";

export interface SubmitWishResult {
  ok: boolean;
  error?: string;
}

export async function submitWish(input: unknown): Promise<SubmitWishResult> {
  const parsed = publicWishSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { invitationId, guestToken, guestName, message, turnstileToken } = parsed.data;

  const verified = await verifyTurnstileToken(turnstileToken);
  if (!verified) {
    return { ok: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const supabase = createSupabaseAdminClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, status")
    .eq("id", invitationId)
    .maybeSingle();

  if (!invitation || invitation.status !== "published") {
    return { ok: false, error: "Undangan tidak ditemukan." };
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
