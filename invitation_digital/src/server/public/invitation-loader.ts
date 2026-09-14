import { unstable_cache } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import type { Guest, PublicInvitation } from "@/types/invitation";

import { loadNormalizedInvitation } from "./normalize";

export type PublicInvitationResult =
  | { kind: "not_found" }
  | { kind: "expired"; displayName: string; eventDate: string | null }
  | { kind: "ok"; invitation: PublicInvitation; guest: Guest | null };

type CachedInvitationResult =
  | { kind: "not_found" }
  | { kind: "found"; status: string; invitation: PublicInvitation };

export function publicInvitationCacheTag(slug: string): string {
  return `public-invitation:${slug}`;
}

async function loadPublicInvitationContent(slug: string): Promise<CachedInvitationResult> {
  const supabase = createSupabaseAdminClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*, theme:themes(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (
    !invitation ||
    !invitation.theme ||
    invitation.status === "draft" ||
    invitation.status === "archived"
  ) {
    return { kind: "not_found" };
  }

  return {
    kind: "found",
    status: invitation.status,
    invitation: await loadNormalizedInvitation(supabase, invitation),
  };
}

function getCachedPublicInvitationContent(slug: string): Promise<CachedInvitationResult> {
  return unstable_cache(
    () => loadPublicInvitationContent(slug),
    ["public-invitation", slug],
    { revalidate: 300, tags: [publicInvitationCacheTag(slug)] },
  )();
}

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
  const cached = await getCachedPublicInvitationContent(slug);
  if (cached.kind === "not_found") return cached;

  const { invitation, status } = cached;

  const isExpired =
    status === "expired" ||
    (invitation.expiresAt !== null && new Date(invitation.expiresAt) < new Date());

  if (isExpired) {
    const displayName = getCoupleDisplayName(
      invitation.people,
      invitation.title,
    );

    return { kind: "expired", displayName, eventDate: invitation.eventDate };
  }

  let guest: Guest | null = null;
  if (guestToken) {
    const supabase = createSupabaseAdminClient();
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

  return { kind: "ok", invitation, guest };
}
