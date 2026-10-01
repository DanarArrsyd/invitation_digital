"use client";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftReceipt({ gift, index }: { gift: GiftAccount; index: number }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <li className="cr-gift-receipt">
      <span className="cr-gift-route" aria-hidden="true">AC/{String(index + 1).padStart(2, "0")}</span>
      <div className="cr-gift-details">
        <p className="cr-gift-provider">{gift.providerName}</p>
        <p className="cr-gift-number">{gift.accountNumber}</p>
        <p className="cr-gift-owner"><span>Atas nama</span> {gift.accountName}</p>
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
