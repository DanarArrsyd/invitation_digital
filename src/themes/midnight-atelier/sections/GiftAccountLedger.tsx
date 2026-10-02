"use client";

import { useRef } from "react";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftAccountLedger({ gift, index }: { gift: GiftAccount; index: number }) {
  const { copied, failed, copy } = useCopyFeedback();
  const numberRef = useRef<HTMLParagraphElement>(null);

  return (
    <li className="ma-gift-ledger">
      <span className="ma-gift-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div className="ma-gift-details">
        <p className="ma-gift-provider">{gift.providerName}</p>
        <p ref={numberRef} className="ma-gift-number">{gift.accountNumber}</p>
        <p className="ma-gift-owner">{`a.n. ${gift.accountName}`}</p>
        <p role="status" className="ma-gift-copy-status">
          {copied
            ? <span className="sr-only">Nomor rekening tersalin.</span>
            : failed
              ? "Tidak bisa menyalin otomatis. Nomor sudah ditandai, tekan lama untuk menyalin."
              : null}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy(gift.accountNumber, numberRef.current)}
        aria-label={`${copied ? "Tersalin" : "Salin nomor"} ${gift.providerName}`}
      >
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </li>
  );
}
