import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { getSessionId } from "@/lib/analytics/session";
import { getInvitationShareData } from "@/lib/share/invitation-share";
import { getPublicInvitationBySlug } from "@/server/public/invitation-loader";
import { trackEvent } from "@/server/public/analytics";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

import { ExpiredState } from "./ExpiredState";

type PublicInvitationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string }>;
};

export async function generateMetadata({
  params,
}: Pick<PublicInvitationPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicInvitationBySlug(slug);

  if (result.kind !== "ok") {
    return {
      title: "Undangan tidak tersedia",
      description: "Undangan digital ini tidak tersedia.",
      robots: { index: false, follow: false },
    };
  }

  const share = getInvitationShareData(result.invitation);

  return {
    title: share.title,
    description: share.description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "Undangan Digital",
      title: share.title,
      description: share.description,
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description: share.description,
    },
  };
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: PublicInvitationPageProps) {
  const { slug } = await params;
  const { guest: guestToken } = await searchParams;

  const result = await getPublicInvitationBySlug(slug, guestToken);

  if (result.kind === "not_found") {
    notFound();
  }

  if (result.kind === "expired") {
    return <ExpiredState displayName={result.displayName} eventDate={result.eventDate} />;
  }

  // Runs after the response is sent — never delays or blocks the render.
  const sessionId = await getSessionId();
  after(() =>
    trackEvent({
      invitationId: result.invitation.id,
      eventType: "invitation_open",
      sessionId,
      guestId: result.guest?.id,
    }),
  );

  return <ThemeRenderer invitation={result.invitation} guest={result.guest} />;
}
