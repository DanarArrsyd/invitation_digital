import type { InvitationEvent } from "@/types/invitation";
import {
  normalizedEventTime,
  timeZoneLabel,
  validEventDate,
  type InvitationTimeZone,
} from "@/themes/shared/calendar";
import { usableExternalUrl } from "@/themes/shared/external-url";

import { Section } from "../components/Section";

function eventDate(value: string): string | null {
  if (!validEventDate(value)) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function EventsSection({
  events,
  mapsEnabled,
  timeZone,
}: {
  events: InvitationEvent[];
  mapsEnabled: boolean;
  timeZone?: InvitationTimeZone;
}) {
  if (events.length === 0) return null;

  return (
    <Section id="ma-acara" labelledBy="ma-events-heading" tone="ink" className="ma-events">
      <header className="ma-chapter-heading ma-chapter-heading-dark">
        <p>Evening programme</p>
        <h2 id="ma-events-heading">Rangkaian acara</h2>
      </header>

      <ol className="ma-event-list">
        {events.map((event, index) => {
          const date = eventDate(event.eventDate);
          const start = normalizedEventTime(event.startTime);
          const end = normalizedEventTime(event.endTime);
          const mapUrl = mapsEnabled ? usableExternalUrl(event.mapsUrl) : null;

          return (
            <li key={event.id} data-event-item={event.id} className="ma-event">
              <div className="ma-event-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="ma-event-main">
                {event.eventType ? <p className="ma-event-type">{event.eventType}</p> : null}
                <h3>{event.title}</h3>
                {date ? <time dateTime={event.eventDate}>{date}</time> : null}
                {start ? <p className="ma-event-time">{start}{end ? ` – ${end}` : ""} {timeZoneLabel(timeZone)}</p> : null}
              </div>
              <div className="ma-event-place">
                {event.venueName ? <p className="ma-event-venue">{event.venueName}</p> : null}
                {event.address ? <p className="ma-event-address">{event.address}</p> : null}
                {mapUrl ? (
                  <div className="ma-event-actions">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buka Maps untuk ${event.title}`}>
                      Buka Maps <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
