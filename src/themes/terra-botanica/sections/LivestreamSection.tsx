import type { InvitationEvent } from "@/types/invitation";
import { usableExternalUrl } from "@/themes/shared/external-url";
import { ExternalArrowIcon } from "@/themes/shared/action-icons";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function LivestreamSection({ events, enabled }: { events: InvitationEvent[]; enabled: boolean }) {
  if (!enabled) return null;
  const links = events.map((event) => ({ event, url: usableExternalUrl(event.livestreamUrl) })).filter((item): item is { event: InvitationEvent; url: string } => item.url !== null);
  if (links.length === 0) return null;

  return (
    <Section id="tb-livestream" labelledBy="tb-livestream-heading" tone="moss" className="tb-livestream">
      <SectionHeading id="tb-livestream-heading" title="Dari kejauhan">
        <p>Ikuti pertemuan ini dari mana pun Anda berada.</p>
      </SectionHeading>
      <ul>{links.map(({ event, url }) => <li key={event.id}><a href={url} target="_blank" rel="noopener noreferrer">{`Saksikan ${event.title}`}<ExternalArrowIcon /></a></li>)}</ul>
    </Section>
  );
}
