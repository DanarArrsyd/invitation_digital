"use client";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftAccountLedger({ gift, index }: { gift: GiftAccount; index: number }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <li className="ma-gift-ledger">
      <span className="ma-gift-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div className="ma-gift-details">
        <p className="ma-gift-provider">{gift.providerName}</p>
        <p className="ma-gift-number">{gift.accountNumber}</p>
        <p className="ma-gift-owner">{`a.n. ${gift.accountName}`}</p>
      </div>
      <button
        type="button"
        onClick={() => void copy(gift.accountNumber)}
        aria-label={`${copied ? "Tersalin" : "Salin nomor"} ${gift.providerName}`}
      >
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </li>
  );
}
