import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import { getDressCode } from "@/lib/utils/dressCode";
import type { ThemeComponentProps } from "@/types/theme";

import { CoverGate } from "./CoverGate";
import type { CalendarEventInput } from "./components/AddToCalendar";
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

function earliestEvent<T extends { eventDate: string }>(events: T[]): T | null {
  if (events.length === 0) return null;
  return [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
}

function countdownTargetIso(
  event: { eventDate: string; startTime: string | null } | null,
  fallbackDate: string | null,
): string | null {
  const eventDate = event?.eventDate ?? fallbackDate;
  if (!eventDate) return null;
  const startTime = event?.startTime ?? null;
  return startTime ? `${eventDate}T${startTime}` : `${eventDate}T00:00:00`;
}

export function NusantaraIvory({ invitation, guest }: ThemeComponentProps) {
  const { features } = invitation;
  const primaryEvent = earliestEvent(invitation.events);
  const countdownTarget = features.countdown
    ? countdownTargetIso(primaryEvent, invitation.eventDate)
    : null;

  const guestDisplayName =
    features.guestPersonalization && guest ? guest.displayName : null;

  const coupleDisplayName = getCoupleDisplayName(invitation.people, invitation.title);
  const eyebrow = invitation.type === "wedding" ? "The Wedding Of" : null;

  const calendarDate = primaryEvent?.eventDate ?? invitation.eventDate;
  const calendarEvent: CalendarEventInput | null =
    countdownTarget && calendarDate
      ? {
          title: primaryEvent ? `${primaryEvent.title} — ${coupleDisplayName}` : coupleDisplayName,
          date: calendarDate,
          startTime: primaryEvent?.startTime ?? null,
          endTime: primaryEvent?.endTime ?? null,
          location: primaryEvent?.venueName ?? invitation.venueSummary ?? null,
          description: `Undangan pernikahan ${coupleDisplayName}`,
        }
      : null;

  const dressCode = features.dressCode ? getDressCode(invitation.theme.settings) : null;

  const heroImageUrl = invitation.media.coverImageUrl;
  const closingImageUrl =
    invitation.gallery.at(-1)?.imageUrl ?? invitation.media.coverImageUrl ?? null;

  const navCandidates: (NavItem | null)[] = [
    { id: "ni-beranda", label: "Beranda", icon: "home" },
    invitation.people.length > 0 ? { id: "ni-mempelai", label: "Mempelai", icon: "heart" } : null,
    { id: "ni-acara", label: "Acara", icon: "calendar" },
    features.story && invitation.stories.length > 0
      ? { id: "ni-cerita", label: "Cerita", icon: "book" }
      : null,
    features.gallery && invitation.gallery.length > 0
      ? { id: "ni-galeri", label: "Galeri", icon: "gallery" }
      : null,
    features.rsvp ? { id: "ni-rsvp", label: "RSVP", icon: "message" } : null,
    features.wishes ? { id: "ni-ucapan", label: "Ucapan", icon: "sparkle" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "ni-kado", label: "Kado", icon: "gift" } : null,
  ];
  const navItems = navCandidates.filter((item): item is NavItem => item !== null).slice(0, 5);

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
        coverImageUrl={invitation.media.coverImageUrl}
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

        {countdownTarget ? (
          <CountdownSection
            targetIso={countdownTarget}
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
