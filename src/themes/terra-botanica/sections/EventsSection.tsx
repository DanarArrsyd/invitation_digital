import type { InvitationEvent } from "@/types/invitation";
import {
  calendarEventForEvent,
  normalizedEventTime,
  timeZoneLabel,
  validEventDate,
  type InvitationTimeZone,
} from "@/themes/shared/calendar";
import { usableExternalUrl } from "@/themes/shared/external-url";

import { AddToCalendar } from "../components/AddToCalendar";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { TypedText } from "../components/TypedText";

export function EventsSection({ events, mapsEnabled, coupleDisplayName, invitationId, timeZone }: {
  events: InvitationEvent[];
  mapsEnabled: boolean;
  coupleDisplayName: string;
  invitationId: string;
  timeZone?: InvitationTimeZone;
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
          const calendarEvent = calendarEventForEvent(event, coupleDisplayName, timeZone);
          const mapUrl = mapsEnabled ? usableExternalUrl(event.mapsUrl) : null;
          return (
            <li key={event.id} data-event-item={event.id} className="tb-event">
              <div className="tb-event-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="tb-event-main">
                <h3>{event.title}</h3>
                {dateIsValid ? <time dateTime={event.eventDate}><TypedText text={new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.eventDate}T00:00:00Z`))} /></time> : null}
                {start ? <p className="tb-event-time"><TypedText text={`${start}${end ? ` – ${end}` : ""} ${timeZoneLabel(timeZone)}`} /></p> : null}
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
