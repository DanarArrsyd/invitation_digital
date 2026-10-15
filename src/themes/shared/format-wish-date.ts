import {
  DEFAULT_INVITATION_TIME_ZONE,
  type InvitationTimeZone,
} from "@/lib/invitations/time-zones";

/** Keep SSR and browser dates aligned to the invitation's Indonesian time zone. */
export function formatWishDate(
  value: string,
  timeZone: InvitationTimeZone = DEFAULT_INVITATION_TIME_ZONE,
): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
}
