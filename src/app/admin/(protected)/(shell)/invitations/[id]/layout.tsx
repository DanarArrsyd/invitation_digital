import { notFound } from "next/navigation";

import { EditorSectionTabs } from "@/components/admin/editor-section-tabs";
import { InvitationEditorHeader } from "@/components/admin/invitation-editor-header";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Editor header shared by every invitation section. Navigation between
 * sections lives in the app sidebar; this block answers "which invitation,
 * in what state" and holds the actions that apply to the whole invitation.
 */
export default async function InvitationEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, title, slug, status, package_key, published_at, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) {
    notFound();
  }

  // Publishing happens on the Publikasi page, next to the readiness
  // checklist; the header only links there or opens the live invitation.
  const isLive = effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published";
  const publicLink = isLive
    ? buildPublishedInvitationPath({ slug: invitation.slug, publishedAt: invitation.published_at })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <InvitationEditorHeader
        invitationId={id}
        title={invitation.title}
        slug={invitation.slug}
        status={invitation.status}
        expiresAt={invitation.expires_at}
        packageLabel={PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].label}
        publicLink={publicLink}
      />

      <EditorSectionTabs invitationId={id} />

      {children}
    </div>
  );
}
