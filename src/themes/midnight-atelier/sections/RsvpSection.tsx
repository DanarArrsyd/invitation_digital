"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRsvpForm } from "@/themes/shared/use-public-forms";

import { Section } from "../components/Section";

export function RsvpSection({ invitationId, slug, guestToken, guestName }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
}) {
  const { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit } = useRsvpForm();

  return (
    <Section id="ma-rsvp" labelledBy="ma-rsvp-heading" tone="lacquer" className="ma-rsvp">
      <header className="ma-interaction-heading">
        <p>Private confirmation</p>
        <h2 id="ma-rsvp-heading">Sampai jumpa malam itu</h2>
        <span>Mohon konfirmasi kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.</span>
      </header>
      <div className="ma-interaction-panel">
        {state.status === "success" ? (
          <div className="ma-form-success" role="status">
            <p>Terima kasih.</p>
            <span>Konfirmasi kehadiran Anda telah kami terima.</span>
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={onSubmit} className="ma-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />
            <input type="hidden" name="attendance" value={attendance ?? ""} />

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

            <fieldset className="ma-attendance">
              <legend>Kehadiran</legend>
              <div className="ma-attendance-choices">
                {([
                  { value: "attending", label: "Hadir" },
                  { value: "not_attending", label: "Tidak Hadir" },
                ] as const).map((option) => (
                  <button
                    className="ma-attendance-choice"
                    key={option.value}
                    type="button"
                    aria-pressed={attendance === option.value}
                    data-selected={attendance === option.value}
                    onClick={() => setAttendance(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <TurnstileWidget />
            {state.status === "error" ? <p className="ma-form-error" role="alert">{state.message}</p> : null}
            <button className="ma-form-submit" type="submit" disabled={isPending || !attendance}>
              <span>{isPending ? "Mengirim..." : "Kirim Konfirmasi"}</span><span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
