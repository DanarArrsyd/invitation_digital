import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GiftAccountCard } from "./GiftAccountCard";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="bs-kado" labelledBy="bs-gift-heading" tone="ground" className="bs-gift">
      <div className="bs-interaction-intro">
        <SectionHeading id="bs-gift-heading" title="Tanda kasih">
          <p>{intro}</p>
        </SectionHeading>
      </div>
      <ul className="bs-gift-list">{gifts.map((gift) => <GiftAccountCard key={gift.id} gift={gift} />)}</ul>
    </Section>
  );
}
