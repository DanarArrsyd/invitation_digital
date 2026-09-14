"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { trackCoverOpenedAction } from "@/app/(public)/[slug]/actions";

import { FloralCorner } from "./components/Botanical";
import { FloatingNav, type NavItem } from "./components/FloatingNav";
import { OrnamentArch, OrnamentDivider } from "./components/Ornament";

function formatEventDate(eventDate: string | null): string {
  if (!eventDate) return "";
  const date = new Date(eventDate);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function splitCoupleName(displayName: string): [string, string] | null {
  const parts = displayName.split(/\s+&\s+/);
  if (parts.length === 2) return [parts[0], parts[1]];
  return null;
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
  coverImageUrl: string | null;
  musicUrl: string | null;
  musicEnabled: boolean;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (opened) contentRef.current?.focus({ preventScroll: true });
  }, [opened]);

  const canPlayMusic = musicEnabled && Boolean(musicUrl);
  const couple = splitCoupleName(displayName);

  function handleOpen() {
    setOpened(true);
    if (canPlayMusic && audioRef.current) {
      audioRef.current.play().catch(() => undefined);
      setPlaying(true);
    }
    // Fire-and-forget — never delays the reveal above.
    trackCoverOpenedAction(invitationId, guestToken).catch(() => undefined);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => undefined);
      setPlaying(true);
    }
  }

  return (
    <>
      {canPlayMusic ? (
        <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" />
      ) : null}

      <AnimatePresence>
        {!opened ? (
          <motion.div
            key="ni-cover"
            className="ni-grain fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-[var(--ni-ivory)]"
            initial={false}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.2 } }
                : {
                    opacity: 0,
                    scale: 1.06,
                    filter: "blur(10px)",
                    transition: { duration: 0.85, ease: [0.7, 0, 0.3, 1] },
                  }
            }
            style={{ pointerEvents: "auto" }}
          >
            <div className="ni-lattice absolute inset-0 opacity-[0.12]" aria-hidden="true" />
            <FloralCorner className="ni-cover-floral-left" />
            <FloralCorner className="ni-cover-floral-right" />

            <div className="relative flex min-h-full items-center justify-center px-7 py-16">
            {/* Arch frame — bound to the content block so short screens still scroll cleanly. */}
            <OrnamentArch className="ni-cover-arch pointer-events-none absolute inset-y-6 left-1/2 w-[min(560px,86vw)] -translate-x-1/2" />

            <motion.div
              className="ni-cover-content relative flex flex-col items-center text-center"
              initial={false}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
              }}
            >
              {(
                [
                  eyebrow ? (
                    <p key="eyebrow" className="ni-eyebrow">
                      {eyebrow}
                    </p>
                  ) : null,

                  couple ? (
                    <h1
                      key="names"
                      className="ni-display mt-6 flex flex-col items-center text-[clamp(2.9rem,13vw,6.5rem)]"
                    >
                      <span>{couple[0]}</span>
                      <span
                        className="my-1 text-[0.42em] italic"
                        style={{ color: "var(--ni-gold)" }}
                      >
                        &amp;
                      </span>
                      <span>{couple[1]}</span>
                    </h1>
                  ) : (
                    <h1
                      key="names"
                      className="ni-display mt-6 text-[clamp(2.4rem,9vw,4.5rem)]"
                    >
                      {displayName}
                    </h1>
                  ),

                  <div key="divider" className="mt-7 flex justify-center">
                    <OrnamentDivider />
                  </div>,

                  eventDate ? (
                    <p
                      key="date"
                      className="mt-6 text-[0.78rem] tracking-[0.34em] uppercase"
                      style={{ color: "var(--ni-brown-soft)" }}
                    >
                      {formatEventDate(eventDate)}
                    </p>
                  ) : null,

                  (
                    <div
                      key="guest"
                      className="ni-recipient mx-auto mt-8 flex w-full max-w-[min(380px,74vw)] flex-col items-center gap-2 border-t border-b px-4 py-5"
                      style={{ borderColor: "rgba(169,138,92,0.28)" }}
                    >
                      <p
                        className="text-[0.66rem] tracking-[0.3em] uppercase"
                        style={{ color: "var(--ni-brown-soft)" }}
                      >
                        Kepada Yth.
                      </p>
                      <p className="ni-serif text-[1.45rem] leading-snug text-[var(--ni-ink)]">
                        {guestDisplayName?.trim() || "Bapak/Ibu/Saudara/i"}
                      </p>
                      <p className="ni-body mt-1 text-xs">Dengan hormat, kami mengundang Anda untuk hadir.</p>
                    </div>
                  ),

                  <div key="cta" className="mt-11">
                    <button
                      type="button"
                      onClick={handleOpen}
                      className="group relative inline-flex min-h-[48px] items-center gap-3 overflow-hidden border px-9 py-3.5 text-[0.72rem] tracking-[0.3em] uppercase transition-colors duration-500"
                      style={{ borderColor: "var(--ni-gold)", color: "var(--ni-brown)" }}
                    >
                      <span
                        className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                        style={{ background: "var(--ni-gold)" }}
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
                  <motion.div
                    key={i}
                    className="ni-cover-stagger"
                    style={{ animationDelay: `${i * .09}s` }}
                    variants={{
                      hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 22 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] },
                      },
                    }}
                  >
                    {node}
                  </motion.div>
                ))}
            </motion.div>
            </div>
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
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1], delay: reduced ? 0 : 0.15 }}
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
              onClick={togglePlay}
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              className="fixed right-5 z-40 flex size-12 items-center justify-center rounded-full border backdrop-blur transition-colors"
              style={{
                bottom: "calc(5.4rem + env(safe-area-inset-bottom))",
                borderColor: "rgba(169,138,92,0.5)",
                background: "rgba(252,250,245,0.88)",
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
