import type { GiftAccount } from "@/types/invitation";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";
import { GiftSlip } from "./GiftSlip";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="kk-kado" labelledBy="kk-gift-heading" className="kk-gift">
      <ChapterHeading
        id="kk-gift-heading"
        eyebrow="Amplop digital"
        title="Tanda Kasih"
        lede={intro}
      />
      <ol className="kk-gift-list">
        {gifts.map((gift, index) => <GiftSlip key={gift.id} gift={gift} index={index} />)}
      </ol>
    </Section>
  );
}
