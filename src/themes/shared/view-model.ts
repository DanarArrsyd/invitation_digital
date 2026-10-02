import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import { getDressCode, type DressCodeSettings } from "@/lib/utils/dressCode";
import type { Guest, InvitationEvent, PublicInvitation } from "@/types/invitation";

import { DEFAULT_INVITATION_TIME_ZONE, timeZoneLabel } from "@/lib/invitations/time-zones";

import { calendarEventForEvent, toEventTimestamp, type CalendarEventInput } from "./calendar";

export interface ThemeViewModel {
  coupleDisplayName: string;
  guestDisplayName: string | null;
  primaryEvent: InvitationEvent | null;
  countdownTarget: number | null;
  calendarEvent: CalendarEventInput | null;
  dressCode: DressCodeSettings | null;
  heroImageUrl: string | null;
  closingImageUrl: string | null;
  /** Short zone name shown next to event times (WIB / WITA / WIT). */
  timeZoneLabel: string;
}

function earliestEvent(events: InvitationEvent[]): InvitationEvent | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
}

export function buildThemeViewModel(invitation: PublicInvitation, guest: Guest | null): ThemeViewModel {
  const { features } = invitation;
  const timeZone = invitation.timeZone ?? DEFAULT_INVITATION_TIME_ZONE;
  const primaryEvent = earliestEvent(invitation.events);
  const countdownTarget = features.countdown
    ? toEventTimestamp(primaryEvent?.eventDate ?? invitation.eventDate, primaryEvent?.startTime ?? null, timeZone)
    : null;
  const coupleDisplayName = getCoupleDisplayName(invitation.people, invitation.title);
  const calendarEvent: CalendarEventInput | null = primaryEvent
    ? calendarEventForEvent(primaryEvent, coupleDisplayName, timeZone)
    : null;

  return {
    coupleDisplayName,
    guestDisplayName: features.guestPersonalization && guest ? guest.displayName : null,
    primaryEvent,
    countdownTarget,
    calendarEvent,
    dressCode: features.dressCode ? getDressCode(invitation.theme.settings) : null,
    heroImageUrl: invitation.media.coverImageUrl,
    closingImageUrl: invitation.gallery.at(-1)?.imageUrl ?? invitation.media.coverImageUrl ?? null,
    timeZoneLabel: timeZoneLabel(timeZone),
  };
}
