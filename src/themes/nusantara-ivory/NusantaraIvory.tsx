import { hasLivestreamLink } from "@/themes/shared/external-url";
import { pickNavItems } from "@/themes/shared/nav-priority";
import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { ThemeComponentProps } from "@/types/theme";

import { CoverGate } from "./CoverGate";
import type { NavItem } from "./components/FloatingNav";
import { ThemeStyles } from "./ThemeStyles";
import { bodyFace, displayFace, scriptFace } from "./fonts";
import { ClosingSection } from "./sections/ClosingSection";
import { CountdownSection } from "./sections/CountdownSection";
import { CoupleSection } from "./sections/CoupleSection";
import { DressCodeSection } from "./sections/DressCodeSection";
import { EventsSection } from "./sections/EventsSection";
import { GallerySection } from "./sections/GallerySection";
import { GiftSection } from "./sections/GiftSection";
import { HeroSection } from "./sections/HeroSection";
import { LivestreamSection } from "./sections/LivestreamSection";
import { QuoteSection } from "./sections/QuoteSection";
import { RsvpSection } from "./sections/RsvpSection";
import { StorySection } from "./sections/StorySection";
import { WishesSection } from "./sections/WishesSection";

export function NusantaraIvory({ invitation, guest }: ThemeComponentProps) {
  const { features } = invitation;
  const {
    primaryEvent,
    countdownTarget,
    guestDisplayName,
    coupleDisplayName,
    calendarEvent,
    dressCode,
    heroImageUrl,
    closingImageUrl,
  } = buildThemeViewModel(invitation, guest);
  const eyebrow = invitation.type === "wedding" ? "The Wedding Of" : null;

  // Page order; pickNavItems keeps the stops the invitation's package includes.
  const navCandidates: (NavItem | null)[] = [
    { id: "ni-beranda", label: "Beranda", icon: "home", section: "hero" },
    invitation.people.length > 0 ? { id: "ni-mempelai", label: "Mempelai", icon: "heart", section: "couple" } : null,
    { id: "ni-acara", label: "Acara", icon: "calendar", section: "events" },
    features.story && invitation.stories.length > 0
      ? { id: "ni-cerita", label: "Cerita", icon: "book", section: "story" }
      : null,
    features.gallery && invitation.gallery.length > 0
      ? { id: "ni-galeri", label: "Galeri", icon: "gallery", section: "gallery" }
      : null,
    features.livestream && hasLivestreamLink(invitation.events)
      ? { id: "ni-livestream", label: "Streaming", icon: "broadcast", section: "livestream" }
      : null,
    features.rsvp ? { id: "ni-rsvp", label: "RSVP", icon: "message", section: "rsvp" } : null,
    features.wishes ? { id: "ni-ucapan", label: "Ucapan", icon: "pen", section: "wishes" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "ni-kado", label: "Kado", icon: "gift", section: "gift" } : null,
  ];
  const navItems = pickNavItems(
    navCandidates.filter((item): item is NavItem => item !== null),
    invitation.navSections,
  );

  return (
    <div className={`ni-theme ${scriptFace.variable} ${displayFace.variable} ${bodyFace.variable}`}>
      <ThemeStyles />

      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        eyebrow={eyebrow}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate}
        guestDisplayName={guestDisplayName}
        musicUrl={invitation.media.musicUrl}
        musicEnabled={features.music}
        navItems={navItems}
      >
        <HeroSection
          coverImageUrl={heroImageUrl}
          displayName={coupleDisplayName}
          eventDate={invitation.eventDate}
          venueSummary={invitation.venueSummary}
        />

        <QuoteSection
          openingQuote={invitation.content.openingQuote}
          openingMessage={invitation.content.openingMessage}
        />

        <CoupleSection people={invitation.people} settings={invitation.theme.settings} />

        <EventsSection
          events={invitation.events}
          venueSummary={invitation.venueSummary}
          showMaps={features.maps}
          timeZone={invitation.timeZone}
        />

        {countdownTarget !== null || calendarEvent ? (
          <CountdownSection
            target={countdownTarget}
            calendarEvent={calendarEvent}
            calendarUid={`${invitation.id}-${primaryEvent?.id ?? "main"}@invitation.digital`}
          />
        ) : null}

        {dressCode ? <DressCodeSection dressCode={dressCode} /> : null}

        {features.story ? <StorySection stories={invitation.stories} /> : null}

        {features.gallery ? <GallerySection gallery={invitation.gallery} /> : null}

        {features.livestream ? <LivestreamSection events={invitation.events} /> : null}

        {features.rsvp ? (
          <RsvpSection
            invitationId={invitation.id}
            slug={invitation.slug}
            guestToken={guest?.token ?? null}
            guestName={guestDisplayName}
          />
        ) : null}

        {features.wishes ? (
          <WishesSection
            invitationId={invitation.id}
            slug={invitation.slug}
            guestToken={guest?.token ?? null}
            guestName={guestDisplayName}
            wishes={invitation.wishes}
          />
        ) : null}

        {features.gift ? <GiftSection gifts={invitation.gifts} /> : null}

        <ClosingSection
          closingMessage={invitation.content.closingMessage}
          title={coupleDisplayName}
          imageUrl={closingImageUrl}
        />
      </CoverGate>
    </div>
  );
}
