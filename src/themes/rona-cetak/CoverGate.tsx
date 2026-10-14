"use client";

import type { ReactNode } from "react";
import { useInvitationCover } from "@/themes/shared/use-invitation-cover";
import { FloatingNav, type NavItem } from "./components/FloatingNav";

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
  const { opened, playing, canPlayMusic, audioRef, contentRef, openInvitation, toggleMusic } =
    useInvitationCover({ invitationId, guestToken, musicEnabled, musicUrl });
  const dateLabel = formatEventDate(eventDate);
  const names = displayName.split(/\s+&\s+/);

  return (
    <div className="rc-gate" data-opened={opened}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}
      <div id="rc-cover" className="rc-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="rc-cover-sheet">
          <div className="rc-cover-layout">
            <div className="rc-cover-topline"><span>Temuraya</span><span>Undangan / 01</span></div>
            <div className="rc-cover-title">
              <p className="rc-label">{label}</p>
              <h1 className="rc-cover-names">
                {names.length === 2 ? <><span>{names[0]}</span><em>&amp;</em><span>{names[1]}</span></> : displayName}
              </h1>
              {dateLabel ? <time className="rc-cover-date" dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
            </div>
            <div className="rc-cover-recipient">
              <div><p>Kepada Yth.</p><p className="rc-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p></div>
              <button type="button" className="rc-action" onClick={openInvitation} disabled={opened} aria-controls="rc-content">Buka Undangan</button>
            </div>
          </div>
        </div>
      </div>
      <div id="rc-content" className="rc-content" ref={contentRef} tabIndex={-1} role="region" aria-label="Isi undangan" hidden={!opened}>{children}</div>
      {opened ? <FloatingNav items={navItems} /> : null}
      {opened && canPlayMusic ? (
        <button type="button" className="rc-music" onClick={toggleMusic} aria-label={playing ? "Jeda musik" : "Putar musik"} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M7 4v16l13-8z" />}
          </svg>
        </button>
      ) : null}
    </div>
  );
}
