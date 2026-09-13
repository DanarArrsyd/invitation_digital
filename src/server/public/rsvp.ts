import "server-only";

import { getSessionId } from "@/lib/analytics/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { publicRsvpSchema } from "@/lib/validation/public-rsvp";
import { trackEvent } from "./analytics";

export interface SubmitRsvpResult {
  ok: boolean;
  error?: string;
}

export async function submitRsvp(input: unknown): Promise<SubmitRsvpResult> {
  const parsed = publicRsvpSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { invitationId, guestToken, guestName, attendance, turnstileToken } = parsed.data;

  const verified = await verifyTurnstileToken(turnstileToken);
  if (!verified) {
    return { ok: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const supabase = createSupabaseAdminClient();

  // Confirm the invitation exists and is actually published — never trust
  // client-supplied invitationId alone for a write.
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

  // One RSVP per guest — resubmitting updates the existing response instead
  // of creating spam duplicates. Guests without a token (no identity) always
  // insert a new row since there's nothing to dedupe against.
  if (guestId) {
    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("invitation_id", invitationId)
      .eq("guest_id", guestId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("rsvps")
        .update({ attendance, guest_name: resolvedGuestName })
        .eq("id", existing.id);

      if (error) return { ok: false, error: "Gagal menyimpan RSVP. Coba lagi." };

      await trackEvent({
        invitationId,
        eventType: "rsvp_submitted",
        sessionId: await getSessionId(),
        guestId,
        metadata: { attendance },
      });

      return { ok: true };
    }
  }

  const { error } = await supabase.from("rsvps").insert({
    invitation_id: invitationId,
    guest_id: guestId,
    guest_name: resolvedGuestName,
    attendance,
  });

  if (error) {
    return { ok: false, error: "Gagal menyimpan RSVP. Coba lagi." };
  }

  await trackEvent({
    invitationId,
    eventType: "rsvp_submitted",
    sessionId: await getSessionId(),
    guestId,
    metadata: { attendance },
  });

  return { ok: true };
}
