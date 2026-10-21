"use client";

import { useState, type FormEvent } from "react";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRsvpForm } from "@/themes/shared/use-public-forms";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function RsvpSection({ invitationId, slug, guestToken, guestName }: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
}) {
  const { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit } = useRsvpForm();
  // The choices stay live while the action is pending; name the answer that was sent.
  const [sentAttending, setSentAttending] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setSentAttending(new FormData(event.currentTarget).get("attendance") === "attending");
    onSubmit(event);
  }

  return (
    <Section id="bs-rsvp" labelledBy="bs-rsvp-heading" tone="plum" className="bs-rsvp">
      <div className="bs-interaction-intro">
        <SectionHeading id="bs-rsvp-heading" title="Sampai jumpa di sana">
          <p>Mohon konfirmasi kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.</p>
        </SectionHeading>
      </div>
      <div className="bs-interaction-body">
        {state.status === "success" ? (
          <div className="bs-form-success" role="status">
            <p>Terima kasih</p>
            <p>Konfirmasi kehadiran Anda telah kami terima.</p>
            <p>Tercatat: {sentAttending ? "Hadir" : "Tidak hadir"}.</p>
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="bs-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />
            <input type="hidden" name="attendance" value={attendance ?? ""} />

            {guestName ? (
              <div className="bs-form-recipient">
                <span>Atas nama</span>
                <strong>{guestName}</strong>
              </div>
            ) : (
              <label className="bs-form-field">
                <span>Nama Anda</span>
                <input type="text" name="guestName" required maxLength={120} autoComplete="name" />
              </label>
            )}

            <fieldset className="bs-attendance">
              <legend>Kehadiran</legend>
              <div className="bs-attendance-choices">
                {([
                  { value: "attending", label: "Hadir" },
                  { value: "not_attending", label: "Tidak Hadir" },
                ] as const).map((option) => (
                  <button key={option.value} type="button" aria-pressed={attendance === option.value} onClick={() => setAttendance(option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <TurnstileWidget />
            {state.status === "error" ? <p className="bs-form-error" role="alert">{state.message}</p> : null}
            <button className="bs-form-submit" type="submit" disabled={isPending || !attendance}>
              {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
