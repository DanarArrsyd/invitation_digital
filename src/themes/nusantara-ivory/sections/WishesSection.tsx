"use client";

import { FloralCorner, BotanicalDivider } from "../components/Botanical";

import { useActionState, useState } from "react";

import { submitWishAction, type WishFormState } from "@/app/(public)/[slug]/actions";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { Wish } from "@/types/invitation";

import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

const initialState: WishFormState = { status: "idle" };
const PAGE_SIZE = 5;

function formatWishDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function WishesSection({
  invitationId,
  slug,
  guestToken,
  guestName,
  wishes,
}: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
  wishes: Wish[];
}) {
  const [state, formAction, isPending] = useActionState(submitWishAction, initialState);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  return (
    <Section id="ni-ucapan" tone="ivory" floral>
      <div className="grid gap-12 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-5">
          <SectionHeading title="Doa & Ucapan" align="left" />

          <Reveal delay={0.08} className="mt-8">
            {state.status === "success" ? (
              <p className="ni-serif text-[1.25rem] text-[var(--ni-ink)]">
                Terima kasih atas ucapan dan doanya.
              </p>
            ) : (
              <form action={formAction} className="flex flex-col gap-6">
                <input type="hidden" name="invitationId" value={invitationId} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="guestToken" value={guestToken ?? ""} />

                {guestName ? (
                  <div className="flex flex-col gap-1">
                    <span className="ni-eyebrow">Atas Nama</span>
                    <span className="ni-serif text-[1.3rem] text-[var(--ni-ink)]">{guestName}</span>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="ni-eyebrow">Nama Anda</span>
                    <input
                      type="text"
                      name="guestName"
                      required
                      className="min-h-[48px] border-b bg-transparent pb-2 text-[1.05rem] text-[var(--ni-ink)] outline-none transition-colors focus:border-[var(--ni-gold)]"
                      style={{ borderColor: "rgba(169,138,92,0.45)" }}
                    />
                  </label>
                )}

                <label className="flex flex-col gap-2">
                  <span className="ni-eyebrow">Ucapan</span>
                  <textarea
                    name="message"
                    required
                    maxLength={500}
                    rows={4}
                    placeholder="Tulis ucapan dan doa..."
                    className="resize-y border-b bg-transparent pb-2 text-[1rem] text-[var(--ni-ink)] outline-none transition-colors placeholder:text-[rgba(124,107,88,0.55)] focus:border-[var(--ni-gold)]"
                    style={{ borderColor: "rgba(169,138,92,0.45)" }}
                  />
                </label>

                <TurnstileWidget />

                {state.status === "error" ? (
                  <p role="alert" className="text-[0.85rem] text-[#8C2F1F]">
                    {state.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-[52px] w-fit border px-9 text-[0.72rem] tracking-[0.3em] uppercase transition-colors duration-300 disabled:opacity-40"
                  style={{ borderColor: "var(--ni-ink)", color: "var(--ni-ink)" }}
                >
                  {isPending ? "Mengirim..." : "Kirim Ucapan"}
                </button>
              </form>
            )}
          </Reveal>
        </div>

        {wishes.length > 0 ? (
          <div className="md:col-span-6 md:col-start-7">
            <div className="flex flex-col">
              {wishes.slice(0, visibleCount).map((wish, index) => (
                <Reveal
                  key={wish.id}
                  variant="up"
                  delay={Math.min(index, 3) * 0.05}
                  className={index === 0 ? "" : "mt-7 border-t pt-7"}
                >
                  <div style={index === 0 ? undefined : { borderColor: "rgba(169,138,92,0.22)" }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="ni-serif text-[1.15rem] text-[var(--ni-ink)]">
                        {wish.guestName}
                      </p>
                      <p
                        className="shrink-0 text-[0.65rem] tracking-[0.2em] uppercase"
                        style={{ color: "var(--ni-gold)" }}
                      >
                        {formatWishDate(wish.createdAt)}
                      </p>
                    </div>
                    <p className="ni-body mt-2 text-[0.92rem] break-words whitespace-pre-line">
                      {wish.message}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            {visibleCount < wishes.length ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="mt-9 min-h-[48px] border px-7 text-[0.68rem] tracking-[0.28em] uppercase transition-colors duration-300 hover:bg-[var(--ni-gold)] hover:text-white"
                style={{ borderColor: "var(--ni-gold)", color: "var(--ni-brown)" }}
              >
                Muat Lebih Banyak
              </button>
            ) : null}
          </div>
        ) : (
          <div className="ni-wishes-empty md:col-span-6 md:col-start-7">
            <FloralCorner />
            <BotanicalDivider />
            <p className="ni-serif max-w-[25ch] text-center text-xl">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
          </div>
        )}
      </div>
    </Section>
  );
}
