"use client";

import { useRef } from "react";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftReceipt({ gift, index }: { gift: GiftAccount; index: number }) {
  const { copied, failed, copy } = useCopyFeedback();
  const numberRef = useRef<HTMLParagraphElement>(null);

  return (
    <li className="cr-gift-receipt">
      <span className="cr-gift-route" aria-hidden="true">Amplop {String(index + 1).padStart(2, "0")}</span>
      <div className="cr-gift-details">
        <p className="cr-gift-provider">{gift.providerName}</p>
        <p ref={numberRef} className="cr-gift-number">{gift.accountNumber}</p>
        <p className="cr-gift-owner"><span>Atas nama</span> {gift.accountName}</p>
        <p role="status" className="cr-gift-copy-status">
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
