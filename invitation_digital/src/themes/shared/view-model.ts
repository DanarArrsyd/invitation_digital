import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import { getDressCode, type DressCodeSettings } from "@/lib/utils/dressCode";
import type { Guest, InvitationEvent, PublicInvitation } from "@/types/invitation";

import { calendarEventForEvent, toWibTimestamp, type CalendarEventInput } from "./calendar";

export interface ThemeViewModel {
  coupleDisplayName: string;
  guestDisplayName: string | null;
  primaryEvent: InvitationEvent | null;
  countdownTarget: number | null;
  calendarEvent: CalendarEventInput | null;
  dressCode: DressCodeSettings | null;
  heroImageUrl: string | null;
  closingImageUrl: string | null;
}

function earliestEvent(events: InvitationEvent[]): InvitationEvent | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
}

export function buildThemeViewModel(invitation: PublicInvitation, guest: Guest | null): ThemeViewModel {
  const { features } = invitation;
  const primaryEvent = earliestEvent(invitation.events);
  const countdownTarget = features.countdown
    ? toWibTimestamp(primaryEvent?.eventDate ?? invitation.eventDate, primaryEvent?.startTime ?? null)
    : null;
  const coupleDisplayName = getCoupleDisplayName(invitation.people, invitation.title);
  const calendarEvent: CalendarEventInput | null = primaryEvent
    ? calendarEventForEvent(primaryEvent, coupleDisplayName)
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
