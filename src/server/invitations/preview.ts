import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadNormalizedInvitation } from "@/server/public/normalize";
import type { PublicInvitation } from "@/types/invitation";

/**
 * Admin preview: same normalization as the public loader (loadNormalizedInvitation)
 * so the theme renders identically — just skips the published/expired gate,
 * since an admin must be able to preview a draft. Requires an authenticated
 * session (RLS "to authenticated" policies), never exposed publicly.
 *
 * `isLive` comes from the stored row: the normalized shape always says
 * "published" because themes only ever receive live data.
 */
export async function getInvitationPreview(
  invitationId: string,
): Promise<{ invitation: PublicInvitation; isLive: boolean } | null> {
  const supabase = await createSupabaseServerClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*, theme:themes(*)")
    .eq("id", invitationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invitation || !invitation.theme) return null;

  return {
    invitation: await loadNormalizedInvitation(supabase, invitation),
    isLive: effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published",
  };
}
