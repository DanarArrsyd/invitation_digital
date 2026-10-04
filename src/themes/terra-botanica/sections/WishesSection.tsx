"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useWishForm, useWishPagination } from "@/themes/shared/use-public-forms";
import type { Wish } from "@/types/invitation";

import { DandelionRelease } from "../components/DandelionRelease";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

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
    <Section id="tb-ucapan" labelledBy="tb-wishes-heading" tone="bone" className="tb-wishes">
      <div className="tb-interaction-intro">
        <SectionHeading id="tb-wishes-heading" title="Doa & ucapan">
          <p>Tinggalkan pesan untuk hari yang kami kenang bersama.</p>
        </SectionHeading>
        {state.status === "success" ? (
          <div className="tb-wish-sent">
            <p className="tb-form-success" role="status">Terima kasih atas ucapan dan doanya.</p>
            <DandelionRelease />
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={onSubmit} className="tb-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />

            {guestName ? (
              <div className="tb-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <label className="tb-form-field">
                <span>Nama Anda</span>
                <input type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </label>
            )}
            <label className="tb-form-field">
              <span>Ucapan</span>
              <textarea name="message" required maxLength={500} rows={4} placeholder="Tulis ucapan dan doa..." />
            </label>

            <TurnstileWidget />
            {state.status === "error" ? <p className="tb-form-error" role="alert">{state.message}</p> : null}
            <button className="tb-form-submit" type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>
        )}
      </div>
      <div className="tb-wishes-feed">
        {wishes.length === 0 ? (
          <p className="tb-wishes-empty">Jadilah yang pertama mengirimkan doa dan ucapan.</p>
        ) : (
          <>
            <ul className="tb-wishes-list">
              {wishes.slice(0, visibleCount).map((wish) => (
                <li key={wish.id} data-wish-id={wish.id}>
                  <div className="tb-wish-meta">
                    <strong>{wish.guestName}</strong>
                    <time dateTime={wish.createdAt}>{formatWishDate(wish.createdAt)}</time>
                  </div>
                  <p>{wish.message}</p>
                </li>
              ))}
            </ul>
            {visibleCount < wishes.length ? <button className="tb-more-wishes" type="button" onClick={showMore}>Muat Lebih Banyak</button> : null}
          </>
        )}
      </div>
    </Section>
  );
}
