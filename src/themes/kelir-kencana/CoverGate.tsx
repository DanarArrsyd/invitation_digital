"use client";

import type { ReactNode } from "react";

import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { Gunungan } from "./components/Gunungan";
import { RouteNavigation, type KelirRouteItem } from "./components/RouteNavigation";
import { WayangFigure } from "./components/WayangFigure";

function formatEventDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

interface CoverGateProps {
  invitationId: string;
  guestToken: string | null;
  intro: string;
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
  routeItems: KelirRouteItem[];
  children: ReactNode;
}

export function CoverGate({
  invitationId,
  guestToken,
  intro,
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
    <div className="kk-gate" data-opened={opened} data-reduced-motion={reducedMotion}>
      {canPlayMusic ? <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" /> : null}

      <div id="kk-cover" className="kk-cover" aria-hidden={opened || undefined} inert={opened}>
        <div className="kk-cover-frame">
          {/* The lit kelir: a gunungan in the centre between two shadow figures.
              Opening pulls the gunungan down out of the screen (dicabut). */}
          <div className="kk-stage" aria-hidden="true">
            <span className="kk-blencong" />
            <WayangFigure name="satria" mode="shadow" className="kk-stage-figure kk-stage-left" />
            <WayangFigure name="putri" mode="shadow" className="kk-stage-figure kk-stage-right" />
            <Gunungan uid="kk-cover-gunungan" className="kk-stage-gunungan" />
          </div>

          <div className="kk-cover-copy">
            <p className="kk-eyebrow kk-cover-intro">{intro}</p>
            <h1 className="kk-cover-names kk-script">
              {names.length === 2 ? (
                <>
                  <span>{names[0]}</span>
                  <span className="kk-cover-amp">&amp;</span>
                  <span>{names[1]}</span>
                </>
              ) : displayName}
            </h1>
            {dateLabel ? <time className="kk-cover-date" dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}

            <div className="kk-cover-recipient">
              <p>Kepada Yth.</p>
              <p className="kk-cover-guest-name">{guestDisplayName || "Bapak/Ibu/Saudara/i"}</p>
            </div>

            <button
              type="button"
              className="kk-cover-open"
              onClick={openInvitation}
              disabled={opened}
              aria-controls="kk-content"
            >
              Buka Undangan
            </button>
          </div>
        </div>
      </div>

      <div
        id="kk-content"
        className="kk-content"
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
          className="kk-music"
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
