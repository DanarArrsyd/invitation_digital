import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import type { Guest, PublicInvitation } from "@/types/invitation";

import { loadNormalizedInvitation } from "./normalize";

export type PublicInvitationResult =
  | { kind: "not_found" }
  | { kind: "expired"; displayName: string; eventDate: string | null }
  | { kind: "ok"; invitation: PublicInvitation; guest: Guest | null };

/**
 * Public-facing loader: resolves a slug to normalized invitation data.
 * Uses the service-role client (server-only) so draft/expired can be
 * distinguished from "does not exist" precisely, per ARCHITECTURE.md
 * section 6 guidance to prefer scoped server credentials over relying on
 * anon RLS for this kind of status-branching read. The theme never touches
 * Supabase directly — only this loader (and the admin preview loader) does.
 */
export async function getPublicInvitationBySlug(
  slug: string,
  guestToken?: string,
): Promise<PublicInvitationResult> {
  const supabase = createSupabaseAdminClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*, theme:themes(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!invitation || !invitation.theme) {
    return { kind: "not_found" };
  }

  // Draft/archived invitations are never publicly visible.
  if (invitation.status === "draft" || invitation.status === "archived") {
    return { kind: "not_found" };
  }

  const isExpired =
    invitation.status === "expired" ||
    (invitation.expires_at !== null && new Date(invitation.expires_at) < new Date());

  if (isExpired) {
    const { data: people } = await supabase
      .from("invitation_people")
      .select("role, nickname, full_name")
      .eq("invitation_id", invitation.id);

    const displayName = getCoupleDisplayName(
      (people ?? []).map((p) => ({ role: p.role, nickname: p.nickname, fullName: p.full_name })),
      invitation.title,
    );

    return { kind: "expired", displayName, eventDate: invitation.event_date };
  }

  let guest: Guest | null = null;
  if (guestToken) {
    const { data: guestRow } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", invitation.id)
      .eq("token", guestToken)
      .maybeSingle();

    if (guestRow) {
      guest = {
        id: guestRow.id,
        displayName: guestRow.display_name,
        token: guestRow.token,
        notes: guestRow.notes,
      };
    }
  }

  const normalized = await loadNormalizedInvitation(supabase, invitation);

  return { kind: "ok", invitation: normalized, guest };
}
