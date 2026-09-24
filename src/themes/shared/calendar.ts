export type CalendarEventInput = {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description?: string | null;
};

/** Wedding venues in this platform are Indonesian; times are entered in WIB. */
const WIB_OFFSET_HOURS = 7;

function toUtcDate(date: string, time: string | null, fallbackHour: number): Date {
  const [h, m] = (time ?? `${String(fallbackHour).padStart(2, "0")}:00`).split(":").map(Number);
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(h - WIB_OFFSET_HOURS, m || 0, 0, 0);
  return d;
}

function formatUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildTimes(event: CalendarEventInput) {
  const startDate = toUtcDate(event.date, event.startTime, 9);
  const endDate = event.endTime
    ? toUtcDate(event.date, event.endTime, 11)
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
