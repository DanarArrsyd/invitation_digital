"use client";

import { useState, type FormEvent } from "react";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRsvpForm } from "@/themes/shared/use-public-forms";

import { Postmark } from "../components/Postmark";
import { Section } from "../components/Section";

export function RsvpSection({ invitationId, slug, guestToken, guestName }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
}) {
  const { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit } = useRsvpForm();
  // The form unmounts on success and the choices stay live while the action
  // is pending; the postmark names the attendance that was actually sent.
  const [sentAttendance, setSentAttendance] = useState<"attending" | "not_attending" | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const sent = new FormData(event.currentTarget).get("attendance");
    setSentAttendance(sent === "attending" || sent === "not_attending" ? sent : null);
    onSubmit(event);
  }

  return (
    <Section id="cr-rsvp" labelledBy="cr-rsvp-heading" tone="cobalt" className="cr-rsvp">
      <header className="cr-interaction-heading">
        <p>Konfirmasi perjalanan</p>
        <h2 id="cr-rsvp-heading">Kami menanti kabar Anda</h2>
        <span>Konfirmasikan kehadiran agar setiap tempat dapat kami siapkan dengan baik.</span>
      </header>

      <div className="cr-rsvp-sheet">
        {state.status === "success" ? (
          <div className="cr-rsvp-receipt">
            <div className="cr-form-success" role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Terima kasih.</strong>
                <p>Konfirmasi kehadiran Anda telah kami terima.</p>
                {/* The postmark is decorative (aria-hidden); the status names the submitted answer. */}
                {sentAttendance ? <p>Tercatat: {sentAttendance === "attending" ? "Hadir" : "Tidak hadir"}.</p> : null}
              </div>
            </div>
            {sentAttendance ? <Postmark attendance={sentAttendance} /> : null}
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="cr-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />
            <input type="hidden" name="attendance" value={attendance ?? ""} />

            {guestName ? (
              <div className="cr-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <div className="cr-form-field">
                <label htmlFor="cr-rsvp-name">Nama Anda</label>
                <input id="cr-rsvp-name" className="cr-form-control" type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </div>
            )}

            <fieldset className="cr-attendance">
              <legend>Kehadiran</legend>
              <div className="cr-attendance-choices">
                {([
                  { value: "attending", label: "Hadir" },
                  { value: "not_attending", label: "Tidak Hadir" },
                ] as const).map((option) => {
                  const selected = attendance === option.value;
                  return (
                    <button
                      className="cr-attendance-choice"
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      data-selected={selected}
                      onClick={() => setAttendance(option.value)}
                    >
                      <span>{option.label}</span>
                      <span className="cr-attendance-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <TurnstileWidget />
            {state.status === "error" ? <p className="cr-form-error" role="alert">{state.message}</p> : null}
            <button className="cr-form-submit" type="submit" disabled={isPending || !attendance}>
              {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
