import type { InvitationEvent } from "@/types/invitation";
import {
  normalizedEventTime,
  timeZoneLabel,
  validEventDate,
  type InvitationTimeZone,
} from "@/themes/shared/calendar";
import { usableExternalUrl } from "@/themes/shared/external-url";
import { ExternalArrowIcon } from "@/themes/shared/action-icons";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function EventsSection({ events, mapsEnabled, timeZone }: {
  events: InvitationEvent[];
  mapsEnabled: boolean;
  timeZone?: InvitationTimeZone;
}) {
  if (events.length === 0) return null;

  return (
    <Section id="jk-acara" labelledBy="jk-acara-heading" tone="fog" className="jk-gathering">
      <SectionHeading id="jk-acara-heading" title="Rangkaian acara">
        <p>Informasi acara untuk hadir dan berbagi waktu bersama.</p>
      </SectionHeading>
      <ol className="jk-event-list">
        {events.map((event, index) => {
          const dateIsValid = validEventDate(event.eventDate);
          const start = normalizedEventTime(event.startTime);
          const end = normalizedEventTime(event.endTime);
          const mapUrl = mapsEnabled ? usableExternalUrl(event.mapsUrl) : null;
          return (
            <li key={event.id} data-event-item={event.id} className="jk-event">
              <div className="jk-event-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="jk-event-main">
                <h3>{event.title}</h3>
                {dateIsValid ? <time dateTime={event.eventDate}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.eventDate}T00:00:00Z`))}</time> : null}
                {start ? <p className="jk-event-time">{`${start}${end ? ` – ${end}` : ""} ${timeZoneLabel(timeZone)}`}</p> : null}
              </div>
              <div className="jk-event-place">
                {event.venueName ? <p className="jk-event-venue">{event.venueName}</p> : null}
                {event.address ? <p className="jk-event-address">{event.address}</p> : null}
                {mapUrl ? <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="jk-text-action" aria-label={`Buka Maps untuk ${event.title}`}>Buka Maps <ExternalArrowIcon /></a> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
