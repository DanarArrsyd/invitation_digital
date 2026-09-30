import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";
import { buildThemeViewModel } from "@/themes/shared/view-model";

import type { NavItem } from "./components/FloatingNav";
import { CoverGate } from "./CoverGate";
import { bodyCondensed, displaySerif } from "./fonts";
import { ClosingSection } from "./sections/ClosingSection";
import { CountdownSection } from "./sections/CountdownSection";
import { CoupleSection } from "./sections/CoupleSection";
import { DressCodeSection } from "./sections/DressCodeSection";
import { EventsSection } from "./sections/EventsSection";
import { HeroSection } from "./sections/HeroSection";
import { LivestreamSection } from "./sections/LivestreamSection";
import { QuoteSection } from "./sections/QuoteSection";
import { ThemeStyles } from "./ThemeStyles";

export function buildMidnightNavItems(invitation: PublicInvitation): NavItem[] {
  const { features } = invitation;
  const candidates: (NavItem | null)[] = [
    { id: "ma-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "ma-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "ma-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "ma-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "ma-galeri", section: "gallery", label: "Galeri" } : null,
    features.rsvp ? { id: "ma-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "ma-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "ma-kado", section: "gift", label: "Kado" } : null,
  ];
  return candidates.filter((item): item is NavItem => item !== null);
}

export function MidnightAtelier({ invitation, guest }: ThemeComponentProps) {
  const {
    coupleDisplayName,
    guestDisplayName,
    primaryEvent,
    heroImageUrl,
    closingImageUrl,
    countdownTarget,
    dressCode,
  } = buildThemeViewModel(invitation, guest);
  const navItems = buildMidnightNavItems(invitation);

  return (
    <div
      className={`ma-theme ${displaySerif.variable} ${bodyCondensed.variable}`}
      data-theme="midnight-atelier"
    >
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        label={invitation.type === "wedding" ? "Midnight Atelier" : "Evening invitation"}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        navItems={navItems}
      >
        <main>
          <HeroSection
            displayName={coupleDisplayName}
            imageUrl={heroImageUrl}
            message={invitation.content.openingMessage}
          />
          <QuoteSection quote={invitation.content.openingQuote} />
          <CoupleSection
            people={invitation.people}
            settings={invitation.theme.settings}
            invitationType={invitation.type}
          />
          <EventsSection
            events={invitation.events}
            mapsEnabled={invitation.features.maps}
            coupleDisplayName={coupleDisplayName}
            invitationId={invitation.id}
          />
          <CountdownSection target={countdownTarget} />
          <DressCodeSection dressCode={dressCode} />
          <LivestreamSection events={invitation.events} enabled={invitation.features.livestream} />
          <ClosingSection
            displayName={coupleDisplayName}
            message={invitation.content.closingMessage}
            imageUrl={closingImageUrl}
            imageAlt={invitation.gallery.at(-1)?.altText ?? null}
          />
        </main>
      </CoverGate>
    </div>
  );
}
