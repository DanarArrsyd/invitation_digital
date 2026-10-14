import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GiftAccountCard } from "./GiftAccountCard";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="rc-kado" labelledBy="rc-gift-heading" tone="paper" className="rc-gift">
      <div className="rc-interaction-intro">
        <SectionHeading id="rc-gift-heading" title="Tanda kasih">
          <p>{intro}</p>
        </SectionHeading>
      </div>
      <ul className="rc-gift-list">{gifts.map((gift) => <GiftAccountCard key={gift.id} gift={gift} />)}</ul>
    </Section>
  );
}
