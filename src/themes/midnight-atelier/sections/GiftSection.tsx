import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";
import { GiftAccountLedger } from "./GiftAccountLedger";

export function GiftSection({ gifts, intro }: { gifts: GiftAccount[]; intro: string }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="ma-kado" labelledBy="ma-gift-heading" tone="ink" className="ma-gift">
      <Spotlight className="ma-interaction-heading">
        <p>Amplop digital</p>
        <h2 id="ma-gift-heading">Tanda kasih</h2>
        <span>{intro}</span>
      </Spotlight>
      <ol className="ma-gift-list">
        {gifts.map((gift, index) => <GiftAccountLedger key={gift.id} gift={gift} index={index} />)}
      </ol>
    </Section>
  );
}
