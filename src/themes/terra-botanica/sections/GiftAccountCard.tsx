"use client";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftAccountCard({ gift }: { gift: GiftAccount }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <li className="tb-gift-account">
      <div>
        <p className="tb-gift-provider">{gift.providerName}</p>
        <p className="tb-gift-number">{gift.accountNumber}</p>
        <p className="tb-gift-owner">{`a.n. ${gift.accountName}`}</p>
      </div>
      <button type="button" onClick={() => void copy(gift.accountNumber)} aria-label={`${copied ? "Tersalin" : "Salin nomor"} ${gift.providerName}`}>
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </li>
  );
}
