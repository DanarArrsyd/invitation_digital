"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useWishForm, useWishPagination } from "@/themes/shared/use-public-forms";
import type { Wish } from "@/types/invitation";

import { Section } from "../components/Section";

const PAGE_SIZE = 5;

function formatWishDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
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
    <Section id="ma-ucapan" labelledBy="ma-wishes-heading" tone="pearl" className="ma-wishes">
      <div className="ma-wishes-compose">
        <header className="ma-interaction-heading">
          <p>Guest book</p>
          <h2 id="ma-wishes-heading">Doa & ucapan</h2>
          <span>Tinggalkan sepatah kata untuk hari yang kami kenang bersama.</span>
        </header>
        {state.status === "success" ? (
          <p className="ma-form-success ma-form-success-dark" role="status">Terima kasih atas ucapan dan doanya.</p>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={onSubmit} className="ma-form ma-form-dark">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />

            {guestName ? (
              <div className="ma-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <label className="ma-form-field">
                <span>Nama Anda</span>
                <input className="ma-form-control" type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </label>
            )}
            <label className="ma-form-field">
              <span>Ucapan</span>
              <textarea className="ma-form-control ma-form-textarea" name="message" required maxLength={500} rows={5} placeholder="Tulis ucapan dan doa..." />
            </label>

            <TurnstileWidget />
            {state.status === "error" ? <p className="ma-form-error" role="alert">{state.message}</p> : null}
            <button className="ma-form-submit" type="submit" disabled={isPending}>
              <span>{isPending ? "Mengirim..." : "Kirim Ucapan"}</span><span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>

      <div className="ma-wishes-ledger" aria-label="Ucapan tamu">
        {wishes.length === 0 ? (
          <p className="ma-wishes-empty">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
        ) : (
          <>
            <ol className="ma-wishes-list">
              {wishes.slice(0, visibleCount).map((wish, index) => (
                <li className="ma-wish-entry" key={wish.id} data-wish-id={wish.id}>
                  <span className="ma-wish-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="ma-wish-meta">
                      <strong>{wish.guestName}</strong>
                      <time dateTime={wish.createdAt}>{formatWishDate(wish.createdAt)}</time>
                    </div>
                    <p>{wish.message}</p>
                  </div>
                </li>
              ))}
            </ol>
            {visibleCount < wishes.length ? (
              <button className="ma-more-wishes" type="button" onClick={showMore}>Muat Lebih Banyak</button>
            ) : null}
          </>
        )}
      </div>
    </Section>
  );
}
