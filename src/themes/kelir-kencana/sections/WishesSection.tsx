"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useWishForm, useWishPagination } from "@/themes/shared/use-public-forms";
import type { Wish } from "@/types/invitation";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

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

  return (
    <Section id="kk-ucapan" labelledBy="kk-wishes-heading" className="kk-wishes">
      <ChapterHeading
        id="kk-wishes-heading"
        eyebrow="Doa dan ucapan"
        title="Ucapan & Doa"
        lede="Tinggalkan pesan untuk hari yang akan kami kenang bersama."
      />

      {state.status === "success" ? (
        <p className="kk-form-success" role="status">Terima kasih atas ucapan dan doanya.</p>
      ) : (
        <form ref={formRef} action={formAction} onSubmit={onSubmit} className="kk-form">
          <input type="hidden" name="invitationId" value={invitationId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="guestToken" value={guestToken ?? ""} />

          {guestName ? (
            <div className="kk-form-recipient">
              <span className="kk-eyebrow">Atas nama</span>
              <strong>{guestName}</strong>
            </div>
          ) : (
            <div className="kk-form-field">
              <label htmlFor="kk-wish-name">Nama Anda</label>
              <input id="kk-wish-name" className="kk-form-control" type="text" name="guestName" required maxLength={120} autoComplete="name" />
            </div>
          )}

          <div className="kk-form-field">
            <label htmlFor="kk-wish-message">Ucapan</label>
            <textarea id="kk-wish-message" className="kk-form-control kk-form-textarea" name="message" required maxLength={500} rows={4} placeholder="Tulis ucapan dan doa..." />
          </div>

          <TurnstileWidget />
          {state.status === "error" ? <p className="kk-form-error" role="alert">{state.message}</p> : null}
          <button className="kk-button kk-button-solid" type="submit" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Ucapan"}
          </button>
        </form>
      )}

      <div className="kk-wishes-ledger" aria-label="Ucapan tamu">
        {wishes.length === 0 ? (
          <p className="kk-wishes-empty">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
        ) : (
          <>
            <ol className="kk-wishes-list">
              {wishes.slice(0, visibleCount).map((wish) => {
                const date = formatWishDate(wish.createdAt);
                return (
                  <li className="kk-wish" key={wish.id} data-wish-id={wish.id}>
                    <div className="kk-wish-meta">
                      <strong>{wish.guestName}</strong>
                      {date ? <time dateTime={wish.createdAt}>{date}</time> : null}
                    </div>
                    <p>{wish.message}</p>
                  </li>
                );
              })}
            </ol>
            {visibleCount < wishes.length ? (
              <button className="kk-button" type="button" onClick={showMore}>Muat Lebih Banyak</button>
            ) : null}
          </>
        )}
      </div>
    </Section>
  );
}
