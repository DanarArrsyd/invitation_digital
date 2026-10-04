import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";
import { GiftAccountLedger } from "./GiftAccountLedger";

export function GiftSection({ gifts }: { gifts: GiftAccount[] }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="ma-kado" labelledBy="ma-gift-heading" tone="ink" className="ma-gift">
      <Spotlight className="ma-interaction-heading">
        <p>Gift registry</p>
        <h2 id="ma-gift-heading">Tanda kasih</h2>
        <span>Doa restu Anda adalah hadiah terindah. Informasi berikut tersedia bila Anda berkenan memberi tanda kasih.</span>
      </Spotlight>
      <ol className="ma-gift-list">
        {gifts.map((gift, index) => <GiftAccountLedger key={gift.id} gift={gift} index={index} />)}
      </ol>
    </Section>
  );
}
