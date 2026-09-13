import { getCoupleDisplayName } from "@/lib/utils/coupleName";
import type { ThemeComponentProps } from "@/types/theme";

import { CoverGate } from "./CoverGate";
import { ThemeStyles } from "./ThemeStyles";
import { bodySans, displaySerif } from "./fonts";
import { ClosingSection } from "./sections/ClosingSection";
import { CountdownSection } from "./sections/CountdownSection";
import { CoupleSection } from "./sections/CoupleSection";
import { EventsSection } from "./sections/EventsSection";
import { GallerySection } from "./sections/GallerySection";
import { GiftSection } from "./sections/GiftSection";
import { HeroSection } from "./sections/HeroSection";
import { LivestreamSection } from "./sections/LivestreamSection";
import { QuoteSection } from "./sections/QuoteSection";
import { RsvpSection } from "./sections/RsvpSection";
import { StorySection } from "./sections/StorySection";
import { WishesSection } from "./sections/WishesSection";

function earliestCountdownTarget(events: { eventDate: string; startTime: string | null }[]) {
  if (events.length === 0) return null;
  const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const first = sorted[0];
  return first.startTime ? `${first.eventDate}T${first.startTime}` : `${first.eventDate}T00:00:00`;
}

export function NusantaraIvory({ invitation, guest }: ThemeComponentProps) {
  const { features } = invitation;
  const countdownTarget = features.countdown
    ? earliestCountdownTarget(invitation.events) ?? invitation.eventDate
    : null;

  const guestDisplayName =
    features.guestPersonalization && guest ? guest.displayName : null;

  const coupleDisplayName = getCoupleDisplayName(invitation.people, invitation.title);
  const eyebrow = invitation.type === "wedding" ? "The Wedding Of" : null;

  const heroImageUrl = invitation.media.coverImageUrl;
  const closingImageUrl =
    invitation.gallery.at(-1)?.imageUrl ?? invitation.media.coverImageUrl ?? null;

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

        {countdownTarget ? <CountdownSection targetIso={countdownTarget} /> : null}

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
