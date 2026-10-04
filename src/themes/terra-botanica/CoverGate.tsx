"use client";

import type { ReactNode } from "react";
import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { Botanical } from "./components/Botanical";
import { FloatingNav, type NavItem } from "./components/FloatingNav";
import { SeedBloom } from "./components/SeedBloom";

function formatEventDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(date);
}

export function CoverGate({
  invitationId, guestToken, label, displayName, eventDate, guestDisplayName,
  musicEnabled, musicUrl, navItems, children,
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
    opened, playing, canPlayMusic,
    audioRef, contentRef, openInvitation, toggleMusic,
  } = useInvitationCover({ invitationId, guestToken, musicEnabled, musicUrl });
  const dateLabel = formatEventDate(eventDate);
  const names = displayName.split(/\s+&\s+/);

  return (
    <div className="tb-gate" data-opened={opened}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}

      <div id="tb-cover" className="tb-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="tb-cover-sheet">
          <div className="tb-cover-art" aria-hidden="true">
            <Botanical variant="clay" className="tb-cover-clay" />
            <Botanical variant="moss" className="tb-cover-moss" />
            <Botanical variant="line" className="tb-cover-line" />
          </div>
          <div className="tb-cover-layout">
            <div className="tb-cover-title">
              <SeedBloom />
              <p className="tb-journal-label">{label}</p>
              <h1 className="tb-cover-names tb-script">
                {names.length === 2 ? (
                  <><span>{names[0]}</span><span className="tb-cover-amp"> &amp; </span><span>{names[1]}</span></>
                ) : displayName}
              </h1>
              {dateLabel ? <time className="tb-cover-date" dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
              <p className="tb-specimen tb-label" aria-hidden="true">Rosa amoris · No. 01</p>
            </div>
            <div className="tb-cover-recipient">
              <p>Kepada Yth.</p>
              <p className="tb-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p>
              <button type="button" className="tb-action" onClick={openInvitation} disabled={opened} aria-controls="tb-content">
                Buka Undangan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="tb-content" className="tb-content" ref={contentRef} tabIndex={-1} role="region" aria-label="Isi undangan" hidden={!opened}>
        {children}
      </div>

      {opened ? <FloatingNav items={navItems} /> : null}
      {opened && canPlayMusic ? (
        <button type="button" className="tb-music" onClick={toggleMusic} aria-label={playing ? "Jeda musik" : "Putar musik"} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M7 4v16l13-8z" />}
          </svg>
        </button>
      ) : null}
    </div>
  );
}
