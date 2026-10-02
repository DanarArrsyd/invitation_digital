"use client";

import { useRef } from "react";

import { useCopyFeedback } from "@/themes/shared/use-copy-feedback";
import type { GiftAccount } from "@/types/invitation";

export function GiftAccountCard({ gift }: { gift: GiftAccount }) {
  const { copied, failed, copy } = useCopyFeedback();
  const numberRef = useRef<HTMLParagraphElement>(null);

  return (
    <li className="tb-gift-account">
      <div>
        <p className="tb-gift-provider">{gift.providerName}</p>
        <p ref={numberRef} className="tb-gift-number">{gift.accountNumber}</p>
        <p className="tb-gift-owner">{`a.n. ${gift.accountName}`}</p>
        <p role="status" className="tb-gift-copy-status">
          {copied
            ? <span className="sr-only">Nomor rekening tersalin.</span>
            : failed
              ? "Tidak bisa menyalin otomatis. Nomor sudah ditandai, tekan lama untuk menyalin."
              : null}
        </p>
      </div>
      <button type="button" onClick={() => void copy(gift.accountNumber, numberRef.current)} aria-label={`${copied ? "Tersalin" : "Salin nomor"} ${gift.providerName}`}>
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </li>
  );
}
