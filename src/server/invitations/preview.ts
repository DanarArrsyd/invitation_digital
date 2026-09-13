import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadNormalizedInvitation } from "@/server/public/normalize";
import type { PublicInvitation } from "@/types/invitation";

/**
 * Admin preview: same normalization as the public loader (loadNormalizedInvitation)
 * so the theme renders identically — just skips the published/expired gate,
 * since an admin must be able to preview a draft. Requires an authenticated
 * session (RLS "to authenticated" policies), never exposed publicly.
 */
export async function getInvitationPreview(invitationId: string): Promise<PublicInvitation | null> {
  const supabase = await createSupabaseServerClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*, theme:themes(*)")
    .eq("id", invitationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invitation || !invitation.theme) return null;

  return loadNormalizedInvitation(supabase, invitation);
}
