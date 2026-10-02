import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { ThemeComponentProps } from "@/types/theme";

import { CoverGate } from "./CoverGate";
import type { NavItem } from "./components/FloatingNav";
import { ThemeStyles } from "./ThemeStyles";
import { bodySans, displaySerif } from "./fonts";
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

  // Page order, each with a priority for the five-slot bar: what guests act
  // on (event details, RSVP, wishes, gift) wins over browsing sections, so
  // a full invitation never hides RSVP behind the gallery.
  const navCandidates: (NavItem & { priority: number } | null)[] = [
    { id: "ni-beranda", label: "Beranda", icon: "home", priority: 5 },
    invitation.people.length > 0 ? { id: "ni-mempelai", label: "Mempelai", icon: "heart", priority: 6 } : null,
    { id: "ni-acara", label: "Acara", icon: "calendar", priority: 1 },
    features.story && invitation.stories.length > 0
      ? { id: "ni-cerita", label: "Cerita", icon: "book", priority: 8 }
      : null,
    features.gallery && invitation.gallery.length > 0
      ? { id: "ni-galeri", label: "Galeri", icon: "gallery", priority: 7 }
      : null,
    features.rsvp ? { id: "ni-rsvp", label: "RSVP", icon: "message", priority: 2 } : null,
    features.wishes ? { id: "ni-ucapan", label: "Ucapan", icon: "pen", priority: 3 } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "ni-kado", label: "Kado", icon: "gift", priority: 4 } : null,
  ];
  const available = navCandidates.filter((item): item is NavItem & { priority: number } => item !== null);
  const chosen = new Set([...available].sort((a, b) => a.priority - b.priority).slice(0, 5));
  const navItems: NavItem[] = available
    .filter((item) => chosen.has(item))
    .map(({ id, label, icon }) => ({ id, label, icon }));

  return (
    <div className={`ni-theme ${displaySerif.variable} ${bodySans.variable}`}>
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
