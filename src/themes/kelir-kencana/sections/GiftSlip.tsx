"use client";

import { useRef } from "react";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

// One account on a slip of shaded kelir with a tumpal edge.
export function GiftSlip({ gift, index }: { gift: GiftAccount; index: number }) {
  const { copied, failed, copy } = useCopyFeedback();
  const numberRef = useRef<HTMLParagraphElement>(null);

  return (
    <li className="kk-gift-slip" data-gift-index={index}>
      <p className="kk-gift-provider">{gift.providerName}</p>
      <p ref={numberRef} className="kk-gift-number">{gift.accountNumber}</p>
      <p className="kk-gift-owner">a.n. {gift.accountName}</p>
      <p role="status" className="kk-gift-copy-status">
        {copied
          ? <span className="sr-only">Nomor rekening tersalin.</span>
          : failed
            ? "Tidak bisa menyalin otomatis. Nomor sudah ditandai, tekan lama untuk menyalin."
            : null}
      </p>
      <button
        type="button"
        className="kk-button"
        onClick={() => void copy(gift.accountNumber, numberRef.current)}
        aria-label={`${copied ? "Tersalin" : "Salin nomor"} ${gift.providerName}`}
      >
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </li>
  );
}
