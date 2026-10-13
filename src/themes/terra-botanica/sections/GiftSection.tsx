import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GiftAccountCard } from "./GiftAccountCard";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="tb-kado" labelledBy="tb-gift-heading" tone="linen" className="tb-gift">
      <div className="tb-interaction-intro">
        <SectionHeading id="tb-gift-heading" title="Tanda kasih">
          <p>{intro}</p>
        </SectionHeading>
      </div>
      <ul className="tb-gift-list">{gifts.map((gift) => <GiftAccountCard key={gift.id} gift={gift} />)}</ul>
    </Section>
  );
}
