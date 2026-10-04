import { usableExternalUrl } from "@/themes/shared/external-url";
import type { InvitationEvent } from "@/types/invitation";

import { Section } from "../components/Section";

export function LivestreamSection({ events, enabled }: { events: InvitationEvent[]; enabled: boolean }) {
  if (!enabled) return null;
  const links = events
    .map((event) => ({ event, url: usableExternalUrl(event.livestreamUrl) }))
    .filter((item): item is { event: InvitationEvent; url: string } => item.url !== null);
  if (links.length === 0) return null;

  return (
    <Section id="cr-livestream" labelledBy="cr-livestream-heading" tone="sea-ink" className="cr-livestream">
      <div className="cr-livestream-copy">
        <p>Siaran langsung</p>
        <h2 id="cr-livestream-heading">Hadir dari mana saja</h2>
        <span>Rayakan bersama kami dari tempat Anda berada.</span>
      </div>
      <ul>
        {links.map(({ event, url }) => (
          <li key={event.id}>
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Saksikan ${event.title}`}>
              <span>{event.title}</span><span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
