import {
  DEFAULT_INVITATION_TIME_ZONE,
  timeZoneOffsetHours,
  type InvitationTimeZone,
} from "@/lib/invitations/time-zones";
import type { InvitationEvent } from "@/types/invitation";

export { timeZoneLabel } from "@/lib/invitations/time-zones";
export type { InvitationTimeZone } from "@/lib/invitations/time-zones";

export type CalendarEventInput = {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description?: string | null;
  /** Wall-clock times above are in this zone (the invitation's time zone). */
  timeZone?: InvitationTimeZone;
};

export function validEventDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizedEventTime(value: string | null): string | null {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
  return value.slice(0, 5);
}

function offsetSuffix(timeZone: InvitationTimeZone): string {
  return `+${String(timeZoneOffsetHours(timeZone)).padStart(2, "0")}:00`;
}

/**
 * A date and optional wall-clock time entered in the invitation's time zone,
 * as an absolute instant, independent of the viewer's own time zone.
 */
export function toEventTimestamp(
  date: string | null,
  time: string | null,
  timeZone: InvitationTimeZone = DEFAULT_INVITATION_TIME_ZONE,
): number | null {
  if (!date || !validEventDate(date)) return null;
  if (time !== null && normalizedEventTime(time) === null) return null;
  const timestamp = Date.parse(`${date}T${time ?? "00:00:00"}${offsetSuffix(timeZone)}`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function calendarEventForEvent(
  event: InvitationEvent,
  coupleDisplayName: string,
  timeZone: InvitationTimeZone = DEFAULT_INVITATION_TIME_ZONE,
): CalendarEventInput | null {
  const startTime = normalizedEventTime(event.startTime);
  const endTime = normalizedEventTime(event.endTime);
  if (!validEventDate(event.eventDate) || !startTime || !endTime || endTime <= startTime) return null;
  return {
    title: `${event.title} — ${coupleDisplayName}`,
    date: event.eventDate,
    startTime,
    endTime,
    location: event.venueName,
    description: `Undangan ${coupleDisplayName}`,
    timeZone,
  };
}

function toUtcDate(date: string, time: string | null, fallbackHour: number, timeZone: InvitationTimeZone): Date {
  const [h, m] = (time ?? `${String(fallbackHour).padStart(2, "0")}:00`).split(":").map(Number);
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(h - timeZoneOffsetHours(timeZone), m || 0, 0, 0);
  return d;
}

function formatUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildTimes(event: CalendarEventInput) {
  const timeZone = event.timeZone ?? DEFAULT_INVITATION_TIME_ZONE;
  const startDate = toUtcDate(event.date, event.startTime, 9, timeZone);
  const endDate = event.endTime
    ? toUtcDate(event.date, event.endTime, 11, timeZone)
    : new Date(startDate.getTime() + 2 * 3_600_000);
  return { start: formatUtcStamp(startDate), end: formatUtcStamp(endDate) };
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildIcsCalendar(event: CalendarEventInput, uid: string, timestamp: Date): string {
  const { start, end } = buildTimes(event);
  const now = formatUtcStamp(timestamp);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitation Digital//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);
  return lines.join("\r\n");
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const { start, end } = buildTimes(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
