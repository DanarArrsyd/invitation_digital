import type { InvitationEvent } from "@/types/invitation";
import { usableExternalUrl } from "@/themes/shared/external-url";

import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";

export function LivestreamSection({ events, enabled }: { events: InvitationEvent[]; enabled: boolean }) {
  if (!enabled) return null;
  const links = events
    .map((event) => ({ event, url: usableExternalUrl(event.livestreamUrl) }))
    .filter((item): item is { event: InvitationEvent; url: string } => item.url !== null);
  if (links.length === 0) return null;

  return (
    <Section id="ma-livestream" labelledBy="ma-livestream-heading" tone="lacquer" className="ma-livestream">
      <Spotlight className="ma-livestream-copy">
        <p>Siaran langsung</p>
        <h2 id="ma-livestream-heading">Dari kejauhan</h2>
        <span>Rayakan bersama kami, dari mana pun Anda berada.</span>
      </Spotlight>
      <ul>
        {links.map(({ event, url }) => (
          <li key={event.id}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <span>Saksikan {event.title}</span><span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
