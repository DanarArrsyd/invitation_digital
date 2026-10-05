import {
  normalizedEventTime,
  timeZoneLabel,
  validEventDate,
  type InvitationTimeZone,
} from "@/themes/shared/calendar";
import { usableExternalUrl } from "@/themes/shared/external-url";
import type { InvitationEvent } from "@/types/invitation";
import { ExternalArrowIcon } from "@/themes/shared/action-icons";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

function readableEventDate(value: string): string | null {
  if (!validEventDate(value)) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

// A pagelaran programme: the start time in a column of its own, the title in
// prada, then the place and the Maps link.
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
  const zone = timeZoneLabel(timeZone);

  return (
    <Section id="kk-acara" labelledBy="kk-events-heading" className="kk-events">
      <ChapterHeading id="kk-events-heading" eyebrow="Susunan acara" title="Rangkaian Acara" />

      <ol className="kk-programme">
        {events.map((event) => {
          const date = readableEventDate(event.eventDate);
          const start = normalizedEventTime(event.startTime);
          const end = normalizedEventTime(event.endTime);
          const mapUrl = mapsEnabled ? usableExternalUrl(event.mapsUrl) : null;

          return (
            <li key={event.id} data-event-item={event.id} className="kk-programme-item">
              <div className="kk-programme-time">
                {start ? (
                  <>
                    <span className="kk-programme-start">{start}</span>
                    <span className="kk-programme-zone">{end ? ` – ${end} ${zone}` : ` ${zone}`}</span>
                  </>
                ) : <span className="kk-programme-start" aria-hidden="true">—</span>}
              </div>
              <div className="kk-programme-body">
                {event.eventType ? <p className="kk-eyebrow">{event.eventType}</p> : null}
                <h3>{event.title}</h3>
                {date ? <time dateTime={event.eventDate}>{date}</time> : null}
                {event.venueName ? <p className="kk-programme-venue">{event.venueName}</p> : null}
                {event.address ? <p className="kk-programme-address">{event.address}</p> : null}
                {mapUrl ? (
                  <a className="kk-text-link" href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buka Maps untuk ${event.title}`}>
                    Buka Maps <ExternalArrowIcon />
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
