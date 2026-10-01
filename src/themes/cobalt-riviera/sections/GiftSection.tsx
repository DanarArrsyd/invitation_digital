import type { GiftAccount } from "@/types/invitation";

import { Section } from "../components/Section";
import { GiftReceipt } from "./GiftReceipt";

export function GiftSection({ gifts }: { gifts: GiftAccount[] }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="cr-kado" labelledBy="cr-gift-heading" tone="pool" className="cr-gift">
      <header className="cr-interaction-heading cr-interaction-heading-dark">
        <p>Travel folio receipts</p>
        <h2 id="cr-gift-heading">Tanda kasih</h2>
        <span>Doa restu Anda adalah hadiah terindah. Informasi berikut tersedia bila Anda berkenan memberi tanda kasih.</span>
      </header>
      <ol className="cr-gift-list">
        {gifts.map((gift, index) => <GiftReceipt key={gift.id} gift={gift} index={index} />)}
      </ol>
    </Section>
  );
}
