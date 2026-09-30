import type { InvitationEvent } from "@/types/invitation";

import { Section } from "../components/Section";
import { usableExternalUrl } from "./EventsSection";

export function LivestreamSection({ events, enabled }: { events: InvitationEvent[]; enabled: boolean }) {
  if (!enabled) return null;
  const links = events
    .map((event) => ({ event, url: usableExternalUrl(event.livestreamUrl) }))
    .filter((item): item is { event: InvitationEvent; url: string } => item.url !== null);
  if (links.length === 0) return null;

  return (
    <Section id="ma-livestream" labelledBy="ma-livestream-heading" tone="lacquer" className="ma-livestream">
      <div className="ma-livestream-copy">
        <p>Remote viewing</p>
        <h2 id="ma-livestream-heading">Dari kejauhan</h2>
        <span>Rayakan bersama kami, dari mana pun Anda berada.</span>
      </div>
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
