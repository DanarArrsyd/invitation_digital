import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";

import { CeramicLine, RouteRule } from "./components/RivieraOrnaments";
import { Section } from "./components/Section";
import { SunMark } from "./components/SunMark";
import type { RivieraRouteItem } from "./components/RouteNavigation";
import { CoverGate } from "./CoverGate";
import { rivieraBody, rivieraDisplay } from "./fonts";
import { ThemeStyles } from "./ThemeStyles";

export function buildCobaltRouteItems(invitation: PublicInvitation): RivieraRouteItem[] {
  const { features } = invitation;
  const candidates: (RivieraRouteItem | null)[] = [
    { id: "cr-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "cr-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "cr-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "cr-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "cr-galeri", section: "gallery", label: "Galeri" } : null,
    features.rsvp ? { id: "cr-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "cr-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "cr-kado", section: "gift", label: "Kado" } : null,
  ];
  return candidates.filter((item): item is RivieraRouteItem => item !== null);
}

export function CobaltRiviera({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName, primaryEvent } = buildThemeViewModel(invitation, guest);
  const routeItems = buildCobaltRouteItems(invitation);

  return (
    <div
      className={`cr-theme ${rivieraDisplay.variable} ${rivieraBody.variable}`}
      data-theme="cobalt-riviera"
    >
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        label={invitation.type === "wedding" ? "Cobalt Riviera" : "Sunlit invitation"}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        routeItems={routeItems}
      >
        <main>
          <Section id="cr-foundation" labelledBy="cr-foundation-title" tone="cobalt">
            <span id="cr-beranda" className="cr-route-anchor" aria-hidden="true" />
            <div className="cr-foundation-layout">
              <header className="cr-foundation-header">
                <p className="cr-kicker">Cobalt Riviera</p>
                <CeramicLine />
              </header>
              <div className="cr-foundation-copy">
                <h1 id="cr-foundation-title" className="cr-display">{coupleDisplayName}</h1>
                <RouteRule />
              </div>
              <footer className="cr-foundation-footer">
                <SunMark />
                {guestDisplayName ? <p className="cr-guest">{guestDisplayName}</p> : null}
              </footer>
            </div>
          </Section>
        </main>
      </CoverGate>
    </div>
  );
}
