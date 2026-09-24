import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import { getDressCode, type DressCodeSettings } from "@/lib/utils/dressCode";
import type { Guest, InvitationEvent, PublicInvitation } from "@/types/invitation";

import type { CalendarEventInput } from "./calendar";

export interface ThemeViewModel {
  coupleDisplayName: string;
  guestDisplayName: string | null;
  primaryEvent: InvitationEvent | null;
  countdownTarget: string | null;
  calendarEvent: CalendarEventInput | null;
  dressCode: DressCodeSettings | null;
  heroImageUrl: string | null;
  closingImageUrl: string | null;
}

function earliestEvent(events: InvitationEvent[]): InvitationEvent | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
}

function countdownTargetIso(event: InvitationEvent | null, fallbackDate: string | null): string | null {
  const eventDate = event?.eventDate ?? fallbackDate;
  if (!eventDate) return null;
  const startTime = event?.startTime ?? null;
  return startTime ? `${eventDate}T${startTime}` : `${eventDate}T00:00:00`;
}

export function buildThemeViewModel(invitation: PublicInvitation, guest: Guest | null): ThemeViewModel {
  const { features } = invitation;
  const primaryEvent = earliestEvent(invitation.events);
  const countdownTarget = features.countdown
    ? countdownTargetIso(primaryEvent, invitation.eventDate)
    : null;
  const coupleDisplayName = getCoupleDisplayName(invitation.people, invitation.title);
  const calendarDate = primaryEvent?.eventDate ?? invitation.eventDate;
  const calendarEvent: CalendarEventInput | null =
    countdownTarget && calendarDate
      ? {
          title: primaryEvent ? `${primaryEvent.title} — ${coupleDisplayName}` : coupleDisplayName,
          date: calendarDate,
          startTime: primaryEvent?.startTime ?? null,
          endTime: primaryEvent?.endTime ?? null,
          location: primaryEvent?.venueName ?? invitation.venueSummary ?? null,
          description: `Undangan pernikahan ${coupleDisplayName}`,
        }
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
  };
}
