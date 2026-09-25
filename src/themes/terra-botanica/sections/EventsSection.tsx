import type { InvitationEvent } from "@/types/invitation";
import type { CalendarEventInput } from "@/themes/shared/calendar";

import { AddToCalendar } from "../components/AddToCalendar";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function usableExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function validEventDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function eventTime(value: string | null): string | null {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
  return value.slice(0, 5);
}

export function EventsSection({ events, mapsEnabled, coupleDisplayName, invitationId }: {
  events: InvitationEvent[];
  mapsEnabled: boolean;
  coupleDisplayName: string;
  invitationId: string;
}) {
  if (events.length === 0) return null;

  return (
    <Section id="tb-acara" labelledBy="tb-acara-heading" tone="clay" className="tb-gathering">
      <SectionHeading id="tb-acara-heading" title="The Gathering">
        <p>Hari-hari untuk bertemu, merayakan, dan berbagi cerita.</p>
      </SectionHeading>
      <ol className="tb-event-list">
        {events.map((event, index) => {
          const dateIsValid = validEventDate(event.eventDate);
          const start = eventTime(event.startTime);
          const end = eventTime(event.endTime);
          const calendarEvent: CalendarEventInput | null = dateIsValid && start !== null && end !== null && end > start ? {
            title: `${event.title} — ${coupleDisplayName}`,
            date: event.eventDate,
            startTime: start,
            endTime: end,
            location: event.venueName,
            description: `Undangan ${coupleDisplayName}`,
          } : null;
          const mapUrl = mapsEnabled ? usableExternalUrl(event.mapsUrl) : null;
          return (
            <li key={event.id} data-event-item={event.id} className="tb-event">
              <div className="tb-event-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="tb-event-main">
                <h3>{event.title}</h3>
                {dateIsValid ? <time dateTime={event.eventDate}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.eventDate}T00:00:00Z`))}</time> : null}
                {start ? <p className="tb-event-time">{start}{end ? ` – ${end}` : ""} WIB</p> : null}
              </div>
              <div className="tb-event-place">
                {event.venueName ? <p className="tb-event-venue">{event.venueName}</p> : null}
                {event.address ? <p className="tb-event-address">{event.address}</p> : null}
                {mapUrl ? <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tb-text-action" aria-label={`Buka Maps untuk ${event.title}`}>Buka Maps <span aria-hidden="true">↗</span></a> : null}
                {calendarEvent ? <AddToCalendar event={calendarEvent} uid={`${invitationId}-${event.id}`} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
