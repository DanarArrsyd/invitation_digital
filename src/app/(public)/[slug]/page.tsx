import { notFound } from "next/navigation";
import { after } from "next/server";

import { getSessionId } from "@/lib/analytics/session";
import { getPublicInvitationBySlug } from "@/server/public/invitation-loader";
import { trackEvent } from "@/server/public/analytics";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

import { ExpiredState } from "./ExpiredState";

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string }>;
}) {
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
