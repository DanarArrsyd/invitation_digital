"use client";

import { useState, type FormEvent } from "react";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useWishForm, useWishPagination } from "@/themes/shared/use-public-forms";
import type { Wish } from "@/types/invitation";

import { Section } from "../components/Section";
import { WishBottle } from "../components/WishBottle";

const PAGE_SIZE = 5;

function formatWishDate(value: string): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function WishesSection({ invitationId, slug, guestToken, guestName, wishes }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
  wishes: Wish[];
}) {
  const { state, formAction, isPending, formRef, onSubmit } = useWishForm();
  const { visibleCount, showMore } = useWishPagination(wishes.length, PAGE_SIZE);
  // The form unmounts on success; keep the text it sent so it can sail away.
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const message = new FormData(event.currentTarget).get("message");
    setSentMessage(typeof message === "string" ? message : null);
    onSubmit(event);
  }

  return (
    <Section id="cr-ucapan" labelledBy="cr-wishes-heading" tone="porcelain" className="cr-wishes">
      <div className="cr-wishes-compose">
        <header className="cr-interaction-heading cr-interaction-heading-dark">
          <p>Pesan dari perjalanan</p>
          <h2 id="cr-wishes-heading">Doa &amp; ucapan</h2>
          <span>Tinggalkan pesan untuk hari yang akan kami kenang bersama.</span>
        </header>

        {state.status === "success" ? (
          <div className="cr-wish-sent">
            <WishBottle message={sentMessage} />
            <p className="cr-form-success cr-form-success-dark" role="status">Terima kasih atas ucapan dan doanya.</p>
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="cr-form cr-wish-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />

            {guestName ? (
              <div className="cr-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <div className="cr-form-field">
                <label htmlFor="cr-wish-name">Nama Anda</label>
                <input id="cr-wish-name" className="cr-form-control" type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </div>
            )}

            <div className="cr-form-field">
              <label htmlFor="cr-wish-message">Ucapan</label>
              <textarea id="cr-wish-message" className="cr-form-control cr-form-textarea" name="message" required maxLength={500} rows={5} placeholder="Tulis ucapan dan doa..." />
            </div>

            <TurnstileWidget />
            {state.status === "error" ? <p className="cr-form-error" role="alert">{state.message}</p> : null}
            <button className="cr-form-submit" type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>
        )}
      </div>

      <div className="cr-wishes-ledger" aria-label="Ucapan tamu">
        {wishes.length === 0 ? (
          <p className="cr-wishes-empty">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
        ) : (
          <>
            <ol className="cr-wishes-list">
              {wishes.slice(0, visibleCount).map((wish, index) => {
                const date = formatWishDate(wish.createdAt);
                return (
                  <li className="cr-wish-entry" key={wish.id} data-wish-id={wish.id}>
                    <span className="cr-wish-route" aria-hidden="true">R{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="cr-wish-meta">
                        <strong>{wish.guestName}</strong>
                        {date ? <time dateTime={wish.createdAt}>{date}</time> : null}
                      </div>
                      <p>{wish.message}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            {visibleCount < wishes.length ? (
              <button className="cr-more-wishes" type="button" onClick={showMore}>Muat Lebih Banyak</button>
            ) : null}
          </>
        )}
      </div>
    </Section>
  );
}
