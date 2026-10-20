"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { InvitationTimeZone } from "@/lib/invitations/time-zones";
import { formatWishDate } from "@/themes/shared/format-wish-date";
import { useWishForm, useWishPagination } from "@/themes/shared/use-public-forms";
import type { Wish } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

const PAGE_SIZE = 5;

export function WishesSection({ invitationId, slug, guestToken, guestName, wishes, prompt, timeZone }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
  wishes: Wish[];
  prompt: string;
  timeZone?: InvitationTimeZone;
}) {
  const { state, formAction, isPending, formRef, onSubmit } = useWishForm();
  const { visibleCount, showMore } = useWishPagination(wishes.length, PAGE_SIZE);

  return (
    <Section id="jk-ucapan" labelledBy="jk-wishes-heading" tone="light" className="jk-wishes">
      <div className="jk-interaction-intro">
        <SectionHeading id="jk-wishes-heading" title="Doa & ucapan">
          <p>{prompt}</p>
        </SectionHeading>
        {state.status === "success" ? (
          <div className="jk-wish-sent">
            <p className="jk-form-success" role="status">Terima kasih atas ucapan dan doanya.</p>
            <span className="jk-wish-confirmation" aria-hidden="true">Terkirim</span>
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={onSubmit} className="jk-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />

            {guestName ? (
              <div className="jk-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <label className="jk-form-field">
                <span>Nama Anda</span>
                <input type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </label>
            )}
            <label className="jk-form-field">
              <span>Ucapan</span>
              <textarea name="message" required maxLength={500} rows={4} placeholder="Tulis ucapan dan doa..." />
            </label>

            <TurnstileWidget />
            {state.status === "error" ? <p className="jk-form-error" role="alert">{state.message}</p> : null}
            <button className="jk-form-submit" type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>
        )}
      </div>
      <div className="jk-wishes-feed">
        {wishes.length === 0 ? (
          <p className="jk-wishes-empty">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
        ) : (
          <>
            <ul className="jk-wishes-list">
              {wishes.slice(0, visibleCount).map((wish) => (
                <li key={wish.id} data-wish-id={wish.id}>
                  <div className="jk-wish-meta">
                    <strong>{wish.guestName}</strong>
                    <time dateTime={wish.createdAt}>{formatWishDate(wish.createdAt, timeZone)}</time>
                  </div>
                  <p>{wish.message}</p>
                </li>
              ))}
            </ul>
            {visibleCount < wishes.length ? <button className="jk-more-wishes" type="button" onClick={showMore}>Muat Lebih Banyak</button> : null}
          </>
        )}
      </div>
    </Section>
  );
}
