"use client";

import type { ReactNode } from "react";

import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { RouteNavigation, type RivieraRouteItem } from "./components/RouteNavigation";
import { SunMark } from "./components/SunMark";

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

interface CoverGateProps {
  invitationId: string;
  guestToken: string | null;
  label: string;
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
  routeItems: RivieraRouteItem[];
  children: ReactNode;
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
  routeItems,
  children,
}: CoverGateProps) {
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
    <div className="cr-gate" data-opened={opened} data-reduced-motion={reducedMotion}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}

      <div id="cr-cover" className="cr-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="cr-horizon" aria-hidden="true">
          <div className="cr-horizon-shutter cr-shutter-upper" />
          <div className="cr-horizon-shutter cr-shutter-lower" />
          <div className="cr-horizon-seam" />
        </div>

        <div className="cr-cover-frame">
          <header className="cr-cover-masthead">
            <span>{label}</span>
            <span>CR / 04</span>
          </header>

          <div className="cr-cover-stage">
            <p className="cr-cover-intro">The wedding of</p>
            <h1 className="cr-cover-names">
              {names.length === 2 ? (
                <>
                  <span>{names[0]}</span>
                  <span className="cr-cover-amp">+</span>
                  <span>{names[1]}</span>
                </>
              ) : displayName}
            </h1>
            {dateLabel ? <time dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
          </div>

          <div className="cr-cover-recipient">
            <div>
              <p>Undangan untuk</p>
              <p className="cr-cover-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p>
            </div>
            <button
              type="button"
              className="cr-cover-open"
              onClick={openInvitation}
              disabled={opened}
              aria-controls="cr-content"
            >
              <SunMark />
              <span>Buka undangan</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="cr-content"
        className="cr-content"
        ref={contentRef}
        tabIndex={-1}
        role="region"
        aria-label="Isi undangan"
        hidden={!opened}
      >
        {children}
      </div>

      {opened ? <RouteNavigation items={routeItems} /> : null}

      {opened && canPlayMusic ? (
        <button
          type="button"
          className="cr-music"
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
