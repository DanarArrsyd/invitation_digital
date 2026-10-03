"use client";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useFocusOnSuccess, useRsvpForm } from "@/themes/shared/use-public-forms";

import { MelatiShower } from "../components/MelatiShower";
import { OrnamentCorner, OrnamentDivider } from "../components/Ornament";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function RsvpSection({
  invitationId,
  slug,
  guestToken,
  guestName,
}: {
  invitationId: string;
  slug: string;
  guestToken: string | null;
  guestName: string | null;
}) {
  const { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit } = useRsvpForm();
  const successRef = useFocusOnSuccess(state.status === "success");

  return (
    <Section id="ni-rsvp" className="ni-rsvp" tone="cream">
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-4">
          <SectionHeading eyebrow="Konfirmasi Kehadiran" title="RSVP" align="left" />
          <Reveal delay={0.1}>
            <p className="ni-body mt-6 max-w-[34ch] text-base">
              Mohon konfirmasi kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.
            </p>
          </Reveal>
        </div>

        <Reveal variant="up" delay={0.08} className="md:col-span-7 md:col-start-6">
          <div
            className="ni-rsvp-panel relative px-6 py-9 sm:px-10 sm:py-11"
            style={{ background: "rgba(252,250,245,0.94)" }}
          >
            <OrnamentCorner className="absolute top-4 left-4 size-8 opacity-60" />
            <OrnamentCorner className="absolute right-4 bottom-4 size-8 rotate-180 opacity-60" />
            {state.status === "success" && attendance === "attending" ? <MelatiShower /> : null}

            {state.status === "success" ? (
              <div
                ref={successRef}
                role="status"
                tabIndex={-1}
                className="flex flex-col items-center gap-5 py-6 text-center outline-none"
              >
                <OrnamentDivider />
                <p className="ni-script text-[2.75rem]">Matur nuwun</p>
                <p className="ni-body max-w-[32ch] text-base">
                  Konfirmasi kehadiran Anda telah kami terima.
                </p>
              </div>
            ) : (
              <form ref={formRef} action={formAction} onSubmit={onSubmit} className="flex flex-col gap-7">
                <input type="hidden" name="invitationId" value={invitationId} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="guestToken" value={guestToken ?? ""} />

                {guestName ? (
                  <div className="flex flex-col gap-1">
                    <span className="ni-eyebrow">Atas Nama</span>
                    <span className="ni-serif text-[1.35rem] text-[var(--ni-ink)]">
                      {guestName}
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="ni-eyebrow">Nama Anda</span>
                    <input
                      type="text"
                      name="guestName"
                      autoComplete="name"
                      required
                      className="min-h-[48px] border-b bg-transparent pb-2 text-[1.05rem] text-[var(--ni-ink)] outline-none transition-colors focus:border-[var(--ni-gold)]"
                      style={{ borderColor: "var(--ni-line-strong)" }}
                    />
                  </label>
                )}

                <fieldset className="flex flex-col gap-3">
                  <legend className="ni-eyebrow mb-3">Kehadiran</legend>
                  {/* Native radios (arrow keys, one tab stop, announced as a
                      choice); controlled so the pick survives a failed submit. */}
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { value: "attending", label: "Hadir" },
                        { value: "not_attending", label: "Tidak Hadir" },
                      ] as const
                    ).map((option) => (
                      <label key={option.value} className="ni-rsvp-option">
                        <input
                          type="radio"
                          name="attendance"
                          value={option.value}
                          required
                          checked={attendance === option.value}
                          onChange={() => setAttendance(option.value)}
                          className="sr-only"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <TurnstileWidget />

                {state.status === "error" ? (
                  <p role="alert" className="text-[0.85rem] text-[var(--ni-danger)]">
                    {state.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isPending || !attendance}
                  className="min-h-[52px] text-[0.72rem] tracking-[0.3em] uppercase transition-opacity duration-300 disabled:opacity-40"
                  style={{ background: "var(--ni-ink)", color: "var(--ni-ivory)" }}
                >
                  {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
