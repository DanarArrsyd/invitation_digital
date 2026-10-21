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
    <div className="bs-gate" data-opened={opened}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}
      <div id="bs-cover" className="bs-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="bs-cover-doors" aria-hidden="true"><span /><span /></div>
        <div className="bs-cover-frame">
          <div className="bs-cover-layout">
            <div className="bs-cover-topline"><span>Temuraya</span><span>Benang Sriwijaya</span></div>
            <div className="bs-cover-title">
              <span className="bs-cover-weave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <p className="bs-label">{label}</p>
              <h1 className="bs-cover-names">
                {names.length === 2 ? <><span>{names[0]}</span><em>&amp;</em><span>{names[1]}</span></> : displayName}
              </h1>
              {dateLabel ? <time className="bs-cover-date" dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
            </div>
            <div className="bs-cover-recipient">
              <div><p>Kepada Yth.</p><p className="bs-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p></div>
              <button type="button" className="bs-action" onClick={openInvitation} disabled={opened} aria-controls="bs-content">Buka Undangan</button>
            </div>
          </div>
        </div>
      </div>
      <div id="bs-content" className="bs-content" ref={contentRef} tabIndex={-1} role="region" aria-label="Isi undangan" hidden={!opened}>{children}</div>
      {opened ? <FloatingNav items={navItems} /> : null}
      {opened && canPlayMusic ? (
        <button type="button" className="bs-music" onClick={toggleMusic} aria-label={playing ? "Jeda musik" : "Putar musik"} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M7 4v16l13-8z" />}
          </svg>
        </button>
      ) : null}
    </div>
  );
}
