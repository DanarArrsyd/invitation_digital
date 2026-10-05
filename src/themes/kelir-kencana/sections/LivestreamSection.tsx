import { usableExternalUrl } from "@/themes/shared/external-url";
import type { InvitationEvent } from "@/types/invitation";
import { ExternalArrowIcon } from "@/themes/shared/action-icons";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

export function LivestreamSection({ events, enabled }: { events: InvitationEvent[]; enabled: boolean }) {
  if (!enabled) return null;
  const links = events
    .map((event) => ({ event, url: usableExternalUrl(event.livestreamUrl) }))
    .filter((item): item is { event: InvitationEvent; url: string } => item.url !== null);
  if (links.length === 0) return null;

  return (
    <Section id="kk-livestream" labelledBy="kk-livestream-heading" tone="malam" className="kk-livestream">
      <ChapterHeading
        id="kk-livestream-heading"
        eyebrow="Siaran langsung"
        title="Saksikan dari Jauh"
        lede="Ikuti acara bersama kami dari tempat Anda berada."
      />
      <ul className="kk-livestream-list">
        {links.map(({ event, url }) => (
          <li key={event.id}>
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Saksikan ${event.title}`}>
              <span>{event.title}</span><ExternalArrowIcon />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
