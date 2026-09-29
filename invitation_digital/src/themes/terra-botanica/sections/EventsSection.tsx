import type { InvitationEvent } from "@/types/invitation";
import { calendarEventForEvent, normalizedEventTime, validEventDate } from "@/themes/shared/calendar";

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
          const start = normalizedEventTime(event.startTime);
          const end = normalizedEventTime(event.endTime);
          const calendarEvent = calendarEventForEvent(event, coupleDisplayName);
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
