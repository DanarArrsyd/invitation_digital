import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GiftAccountCard } from "./GiftAccountCard";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="jk-kado" labelledBy="jk-gift-heading" tone="concrete" className="jk-gift">
      <div className="jk-interaction-intro">
        <SectionHeading id="jk-gift-heading" title="Tanda kasih">
          <p>{intro}</p>
        </SectionHeading>
      </div>
      <ul className="jk-gift-list">{gifts.map((gift) => <GiftAccountCard key={gift.id} gift={gift} />)}</ul>
    </Section>
  );
}
