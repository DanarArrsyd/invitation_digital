import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import type { PublicInvitation } from "@/types/invitation";

type ShareInvitation = Pick<
  PublicInvitation,
  "title" | "eventDate" | "venueSummary" | "people" | "media"
>;

export interface InvitationShareData {
  displayName: string;
  primaryName: string;
  secondaryName: string;
  title: string;
  description: string;
  dateLabel: string | null;
  venueLabel: string | null;
  coverImageUrl: string | null;
}

export function buildPublishedInvitationPath({
  slug,
  publishedAt,
  guestToken,
}: {
  slug: string;
  publishedAt: string | null;
  guestToken?: string;
}): string {
  const query: string[] = [];
  if (guestToken) query.push(`guest=${encodeURIComponent(guestToken)}`);

  const publishedTimestamp = publishedAt ? Date.parse(publishedAt) : Number.NaN;
  if (Number.isFinite(publishedTimestamp)) query.push(`v=${publishedTimestamp}`);

  const queryString = query.length > 0 ? `?${query.join("&")}` : "";
  return `/${encodeURIComponent(slug)}${queryString}`;
}

export function toAbsoluteInvitationUrl(path: string, origin: string): string {
  return new URL(path, origin).toString();
}

function formatEventDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getInvitationShareData(invitation: ShareInvitation): InvitationShareData {
  const displayName = getCoupleDisplayName(invitation.people, invitation.title);
  const bride = invitation.people.find((person) => person.role === "bride");
  const groom = invitation.people.find((person) => person.role === "groom");
  const primaryName = bride?.nickname || bride?.fullName || displayName;
  const secondaryName = groom?.nickname || groom?.fullName || "";
  const dateLabel = formatEventDate(invitation.eventDate);
  const venueLabel = invitation.venueSummary?.trim() || null;
  const detail = [dateLabel ? `pada ${dateLabel}` : null, venueLabel ? `di ${venueLabel}` : null]
    .filter(Boolean)
    .join(" ");

  return {
    displayName,
    primaryName,
    secondaryName,
    title: `Undangan Pernikahan ${displayName}`,
    description: detail
      ? `${displayName} mengundang Anda ${detail}.`
      : `${displayName} mengundang Anda untuk merayakan hari bahagia mereka.`,
    dateLabel,
    venueLabel,
    coverImageUrl: invitation.media.coverImageUrl,
  };
}
