import { notFound } from "next/navigation";

import { EditorSectionTabs } from "@/components/admin/editor-section-tabs";
import { InvitationEditorHeader } from "@/components/admin/invitation-editor-header";
import { getPublishReadiness } from "@/lib/invitations/readiness";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";
import { resolveInvitationFeatures } from "@/server/public/normalize";

/**
 * Editor header shared by every invitation section. Navigation between
 * sections lives in the app sidebar; this block answers "which invitation,
 * in what state, how ready" and holds the actions for the whole invitation.
 * The detail query is request-cached, so the section page reuses it.
 */
export default async function InvitationEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation } = detail;
  const packageKey = invitation.package_key as PackageKey;

  // Publishing happens on the Publikasi page, next to the readiness
  // checklist; the header only links there or opens the live invitation.
  const isLive = effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published";
  const publicLink = isLive
    ? buildPublishedInvitationPath({ slug: invitation.slug, publishedAt: invitation.published_at })
    : null;

  const readiness = getPublishReadiness({
    features: resolveInvitationFeatures(packageKey, invitation.settings),
    peopleCount: detail.people.length,
    eventCount: detail.events.length,
    hasCoverImage: Boolean(invitation.cover_image_path),
    hasMusic: Boolean(invitation.music_path),
    galleryCount: detail.gallery.length,
    giftCount: detail.gifts.length,
    storyCount: detail.stories.length,
    guestCount: detail.guests.length,
  });

  return (
    <div className="flex flex-col gap-6">
      <InvitationEditorHeader
        invitationId={id}
        title={invitation.title}
        slug={invitation.slug}
        status={invitation.status}
        expiresAt={invitation.expires_at}
        eventDate={invitation.event_date}
        packageLabel={PACKAGE_DEFINITIONS[packageKey].label}
        themeName={detail.themes.find((theme) => theme.id === invitation.theme_id)?.name ?? null}
        coverUrl={getMediaPublicUrl(invitation.cover_image_path ?? detail.gallery[0]?.image_path ?? null)}
        readiness={{
          done: readiness.filter((item) => item.done).length,
          total: readiness.length,
          missing: readiness.filter((item) => !item.done).map((item) => item.label),
        }}
        publicLink={publicLink}
      />

      <EditorSectionTabs invitationId={id} />

      {children}
    </div>
  );
}
