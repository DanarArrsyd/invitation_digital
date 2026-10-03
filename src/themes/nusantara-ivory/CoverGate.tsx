"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";

import { getCoupleInitials } from "@/lib/utils/coupleName";
import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { MonogramBadge } from "./components/Botanical";
import { FloatingNav, type NavItem } from "./components/FloatingNav";
import { Gunungan, OrnamentDivider } from "./components/Ornament";

function formatEventDate(eventDate: string | null): string {
  if (!eventDate) return "";
  // Plain YYYY-MM-DD: format in UTC so no viewer timezone shifts the day.
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${eventDate}T00:00:00Z`));
}

function splitCoupleName(displayName: string): [string, string] | null {
  const parts = displayName.split(/\s+&\s+/);
  if (parts.length === 2) return [parts[0], parts[1]];
  return null;
}

const GATE_EASE = [0.65, 0, 0.25, 1] as const;

/**
 * Exit choreography for the gunungan gate. The cover only waits for its
 * leaves (it never fades), the text clears first, then the two halves slide
 * apart like a dalang parting the kayon. Reduced motion: a short fade.
 */
function gateVariants(reduced: boolean): Record<"cover" | "content" | "left" | "right", Variants> {
  if (reduced) {
    return {
      cover: { exit: { opacity: 0, pointerEvents: "none", transition: { duration: 0.2 } } },
      content: {},
      left: {},
      right: {},
    };
  }
  return {
    cover: { exit: { opacity: 1, pointerEvents: "none", transition: { duration: 1.2 } } },
    content: { exit: { opacity: 0, transition: { duration: 0.25 } } },
    left: { exit: { x: "-101%", transition: { duration: 0.95, delay: 0.2, ease: GATE_EASE } } },
    right: { exit: { x: "101%", transition: { duration: 0.95, delay: 0.2, ease: GATE_EASE } } },
  };
}

export function CoverGate({
  invitationId,
  guestToken,
  eyebrow,
  displayName,
  eventDate,
  guestDisplayName,
  musicUrl,
  musicEnabled,
  navItems,
  children,
}: {
  invitationId: string;
  guestToken: string | null;
  eyebrow: string | null;
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  musicUrl: string | null;
  musicEnabled: boolean;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const {
    opened, playing, canPlayMusic, reducedMotion: reduced,
    audioRef, contentRef, openInvitation, toggleMusic,
  } = useInvitationCover({ invitationId, guestToken, musicEnabled, musicUrl });
  const couple = splitCoupleName(displayName);
  const initials = getCoupleInitials(displayName);
  const gate = gateVariants(reduced);

  return (
    <>
      {canPlayMusic ? (
        <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" />
      ) : null}

      <AnimatePresence>
        {!opened ? (
          <motion.div
            key="ni-cover"
            className="ni-gate fixed inset-0 z-50"
            variants={gate.cover}
            initial={false}
            exit="exit"
            style={{ pointerEvents: "auto" }}
          >
            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                className={`ni-gate-leaf ni-gate-leaf--${side} ni-grain`}
                variants={gate[side]}
                data-ni-gate-leaf=""
                aria-hidden="true"
              >
                <div className="ni-lattice absolute inset-0 opacity-[0.12]" />
                <Gunungan className="ni-gate-gunungan" />
              </motion.div>
            ))}

            <motion.div className="ni-gate-scroll" variants={gate.content}>
              <div className="relative flex min-h-full items-center justify-center px-7 py-16">
                {/* Entrance stagger is CSS (.ni-cover-stagger + animation-delay),
                    so it runs before hydration and respects reduced motion. */}
                <div className="ni-cover-content relative flex flex-col items-center text-center">
                  {(
                    [
                      eyebrow ? (
                        <p key="eyebrow" className="ni-eyebrow">
                          {eyebrow}
                        </p>
                      ) : null,

                      initials ? (
                        <div key="monogram" className="mt-5">
                          <MonogramBadge initials={initials} />
                        </div>
                      ) : null,

                      couple ? (
                        <h1
                          key="names"
                          className="ni-script mt-6 flex flex-col items-center text-[clamp(3.4rem,15vw,7rem)]"
                        >
                          <span>{couple[0]}</span>
                          <span className="my-1 text-[0.5em]" style={{ color: "var(--ni-gold)" }}>
                            &amp;
                          </span>
                          <span>{couple[1]}</span>
                        </h1>
                      ) : (
                        <h1 key="names" className="ni-script mt-6 text-[clamp(2.8rem,11vw,5.2rem)]">
                          {displayName}
                        </h1>
                      ),

                      <div key="divider" className="mt-7 flex justify-center">
                        <OrnamentDivider />
                      </div>,

                      eventDate ? (
                        <p
                          key="date"
                          className="ni-caps mt-6 text-[0.8rem] tracking-[0.3em] uppercase"
                          style={{ color: "var(--ni-brown-soft)" }}
                        >
                          {formatEventDate(eventDate)}
                        </p>
                      ) : null,

                      (
                        <div
                          key="guest"
                          className="ni-recipient mx-auto mt-8 flex w-full max-w-[min(380px,74vw)] flex-col items-center gap-2 border-t border-b px-4 py-5"
                          style={{ borderColor: "var(--ni-line)" }}
                        >
                          <p
                            className="ni-caps text-[0.66rem] tracking-[0.3em] uppercase"
                            style={{ color: "var(--ni-brown-soft)" }}
                          >
                            Kepada Yth.
                          </p>
                          <p className="ni-serif text-[1.45rem] leading-snug text-[var(--ni-ink)]">
                            {guestDisplayName?.trim() || "Bapak/Ibu/Saudara/i"}
                          </p>
                          <p className="ni-body mt-1 text-base">Dengan hormat, kami mengundang Anda untuk hadir.</p>
                        </div>
                      ),

                      <div key="cta" className="mt-11">
                        <button
                          type="button"
                          onClick={openInvitation}
                          className="ni-caps group relative inline-flex min-h-[48px] items-center gap-3 overflow-hidden border px-9 py-3.5 text-[0.74rem] tracking-[0.28em] uppercase transition-colors duration-500"
                          style={{ borderColor: "var(--ni-gold)", color: "var(--ni-brown)" }}
                        >
                          <span
                            className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                            style={{ background: "var(--ni-sogan)" }}
                            aria-hidden="true"
                          />
                          <span className="relative transition-colors duration-500 group-hover:text-white">
                            Buka Undangan
                          </span>
                        </button>
                      </div>,
                    ] as (React.ReactElement | null)[]
                  )
                    .filter(Boolean)
                    .map((node, i) => (
                      <div key={i} className="ni-cover-stagger" style={{ animationDelay: `${i * .09}s` }}>
                        {node}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {opened ? (
        <motion.div
          ref={contentRef}
          tabIndex={-1}
          role="region"
          aria-label="Isi undangan"
          className="outline-none"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay: reduced ? 0 : 0.1 }}
        >
          {children}
        </motion.div>
      ) : null}

      {opened ? <FloatingNav items={navItems} /> : null}

      {/* Kept outside the animated wrapper: an ancestor transform would turn
          this fixed control into an absolutely positioned one. */}
      {opened && canPlayMusic ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
          className="fixed right-5 z-40 flex size-12 items-center justify-center rounded-full border backdrop-blur transition-colors"
          style={{
            // Clears the floating nav, which only renders with 2+ items.
            bottom: navItems.length >= 2
              ? "calc(5.4rem + env(safe-area-inset-bottom))"
              : "calc(1.25rem + env(safe-area-inset-bottom))",
            borderColor: "var(--ni-line-strong)",
            background: "rgba(248,241,228,0.88)",
            color: "var(--ni-brown)",
          }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>
      ) : null}
    </>
  );
}
