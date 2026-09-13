"use client";

import { useState } from "react";

import type { GiftAccount } from "@/types/invitation";

export function GiftAccountCard({ gift }: { gift: GiftAccount }) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className="relative flex h-full flex-col justify-between gap-7 border p-7 sm:p-8"
      style={{
        borderColor: "rgba(199,174,133,0.35)",
        background: "rgba(252,250,245,0.04)",
      }}
    >
      <div className="flex flex-col gap-3">
        <p className="ni-eyebrow" style={{ color: "var(--ni-gold-soft)" }}>
          {gift.providerName}
        </p>
        <p
          className="ni-serif text-[clamp(1.6rem,4vw,2.3rem)] leading-tight tabular-nums"
          style={{ color: "var(--ni-ivory)" }}
        >
          {gift.accountNumber}
        </p>
        <p className="text-[0.85rem]" style={{ color: "rgba(252,250,245,0.62)" }}>
          a.n. {gift.accountName}
        </p>
      </div>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(gift.accountNumber);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="min-h-[48px] w-full border text-[0.68rem] tracking-[0.28em] uppercase transition-colors duration-300"
        style={{
          borderColor: copied ? "var(--ni-gold)" : "rgba(199,174,133,0.5)",
          background: copied ? "var(--ni-gold)" : "transparent",
          color: copied ? "#FFFFFF" : "var(--ni-gold-soft)",
        }}
      >
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </div>
  );
}
