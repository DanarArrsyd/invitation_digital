import { EVENT_TYPE_LABELS, isEventType } from "@/lib/marketing/event-types";
import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import type { PublicInvitation } from "@/types/invitation";

type ShareInvitation = Pick<
  PublicInvitation,
  "title" | "eventDate" | "venueSummary" | "people" | "media"
> &
  Partial<Pick<PublicInvitation, "type">>;

/** "Undangan Pernikahan", "Undangan Aqiqah", …; weddings when the type is unknown. */
export function getInvitationEyebrow(type: string | undefined): string {
  return `Undangan ${isEventType(type) ? EVENT_TYPE_LABELS[type] : EVENT_TYPE_LABELS.wedding}`;
}

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

/** Avoids "Undangan Aqiqah Aqiqah Raka" when the title already names the event. */
function shareTitle(eyebrow: string, displayName: string): string {
  const name = displayName.toLowerCase();
  if (name.startsWith("undangan")) return displayName;
  const eventLabel = eyebrow.slice("Undangan ".length).toLowerCase();
  return name.includes(eventLabel) ? `Undangan ${displayName}` : `${eyebrow} ${displayName}`;
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
    title: shareTitle(getInvitationEyebrow(invitation.type), displayName),
    description: detail
      ? `${displayName} mengundang Anda ${detail}.`
      : `${displayName} mengundang Anda untuk merayakan hari bahagia mereka.`,
    dateLabel,
    venueLabel,
    coverImageUrl: invitation.media.coverImageUrl,
  };
}
