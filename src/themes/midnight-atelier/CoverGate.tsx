"use client";

import type { ReactNode } from "react";

import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { AtelierMark } from "./components/AtelierMark";
import { FloatingNav, type NavItem } from "./components/FloatingNav";

function formatEventDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function CoverGate({
  invitationId,
  guestToken,
  label,
  displayName,
  eventDate,
  guestDisplayName,
  musicEnabled,
  musicUrl,
  navItems,
  children,
}: {
  invitationId: string;
  guestToken: string | null;
  label: string;
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const {
    opened,
    playing,
    canPlayMusic,
    reducedMotion,
    audioRef,
    contentRef,
    openInvitation,
    toggleMusic,
  } = useInvitationCover({ invitationId, guestToken, musicEnabled, musicUrl });
  const dateLabel = formatEventDate(eventDate);
  const names = displayName.split(/\s+&\s+/);

  return (
    <div className="ma-gate" data-opened={opened} data-reduced-motion={reducedMotion}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}

      <div id="ma-cover" className="ma-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="ma-curtain" aria-hidden="true">
          <div className="ma-curtain-panel ma-curtain-left" />
          <div className="ma-curtain-panel ma-curtain-right" />
          <div className="ma-curtain-seam"><AtelierMark /></div>
        </div>

        <div className="ma-cover-frame">
          <header className="ma-cover-masthead">
            <span>{label}</span>
            <span>Private celebration</span>
          </header>

          <div className="ma-cover-stage">
            <p className="ma-cover-intro">The wedding of</p>
            <h1 className="ma-cover-names ma-script">
              {names.length === 2 ? (
                <><span>{names[0]}</span><span className="ma-cover-amp">&amp;</span><span>{names[1]}</span></>
              ) : displayName}
            </h1>
            {dateLabel ? <time dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
          </div>

          <div className="ma-cover-recipient">
            <p>Undangan untuk</p>
            <p className="ma-cover-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p>
            <button
              type="button"
              className="ma-cover-open"
              onClick={openInvitation}
              disabled={opened}
              aria-controls="ma-content"
            >
              <span>Buka undangan</span>
              <span aria-hidden="true">Open</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="ma-content"
        className="ma-content"
        ref={contentRef}
        tabIndex={-1}
        role="region"
        aria-label="Isi undangan"
        hidden={!opened}
      >
        {children}
      </div>

      {opened ? <FloatingNav items={navItems} /> : null}

      {opened && canPlayMusic ? (
        <button
          type="button"
          className="ma-music"
          onClick={toggleMusic}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
          aria-pressed={playing}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing ? <path d="M7 5h3v14H7zm7 0h3v14h-3z" /> : <path d="M8 4v16l11-8L8 4Z" />}
          </svg>
        </button>
      ) : null}
    </div>
  );
}
