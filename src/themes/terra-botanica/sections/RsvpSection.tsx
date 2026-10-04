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
    <Section id="tb-rsvp" labelledBy="tb-rsvp-heading" tone="moss" className="tb-rsvp">
      <div className="tb-interaction-intro">
        <SectionHeading id="tb-rsvp-heading" title="Sampai jumpa di sana">
          <p>Mohon konfirmasi kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.</p>
        </SectionHeading>
      </div>
      <div className="tb-interaction-body">
        {state.status === "success" ? (
          <div className="tb-form-success" role="status">
            <p>Terima kasih</p>
            <p>Konfirmasi kehadiran Anda telah kami terima.</p>
            <p>Tercatat: {sentAttending ? "Hadir" : "Tidak hadir"}.</p>
          </div>
        ) : (
          <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="tb-form">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="guestToken" value={guestToken ?? ""} />
            <input type="hidden" name="attendance" value={attendance ?? ""} />

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

            <fieldset className="tb-attendance">
              <legend>Kehadiran</legend>
              <div className="tb-attendance-choices">
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
            {state.status === "error" ? <p className="tb-form-error" role="alert">{state.message}</p> : null}
            <button className="tb-form-submit" type="submit" disabled={isPending || !attendance}>
              {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
