"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRsvpForm } from "@/themes/shared/use-public-forms";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

export function RsvpSection({ invitationId, slug, guestToken, guestName }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
}) {
  const { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit } = useRsvpForm();

  return (
    <Section id="kk-rsvp" labelledBy="kk-rsvp-heading" className="kk-rsvp">
      <ChapterHeading
        id="kk-rsvp-heading"
        eyebrow="Konfirmasi kehadiran"
        title="Mohon Kabar Anda"
        lede="Konfirmasikan kehadiran agar kami dapat menyiapkan tempat dengan baik."
      />

      {state.status === "success" ? (
        <div className="kk-form-success" role="status">
          <strong>Matur nuwun.</strong>
          <p>Konfirmasi kehadiran Anda telah kami terima.</p>
        </div>
      ) : (
        <form ref={formRef} action={formAction} onSubmit={onSubmit} className="kk-form">
          <input type="hidden" name="invitationId" value={invitationId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="guestToken" value={guestToken ?? ""} />
          <input type="hidden" name="attendance" value={attendance ?? ""} />

          {guestName ? (
            <div className="kk-form-recipient">
              <span className="kk-eyebrow">Atas nama</span>
              <strong>{guestName}</strong>
            </div>
          ) : (
            <div className="kk-form-field">
              <label htmlFor="kk-rsvp-name">Nama Anda</label>
              <input id="kk-rsvp-name" className="kk-form-control" type="text" name="guestName" required maxLength={120} autoComplete="name" />
            </div>
          )}

          <fieldset className="kk-attendance">
            <legend>Kehadiran</legend>
            <div className="kk-attendance-choices">
              {([
                { value: "attending", label: "Hadir" },
                { value: "not_attending", label: "Tidak Hadir" },
              ] as const).map((option) => {
                const selected = attendance === option.value;
                return (
                  <button
                    className="kk-attendance-choice"
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    data-selected={selected}
                    onClick={() => setAttendance(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <TurnstileWidget />
          {state.status === "error" ? <p className="kk-form-error" role="alert">{state.message}</p> : null}
          <button className="kk-button kk-button-solid" type="submit" disabled={isPending || !attendance}>
            {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>
        </form>
      )}
    </Section>
  );
}
