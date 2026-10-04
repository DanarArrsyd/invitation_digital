import { pickNavItems, type NavSectionKey } from "@/themes/shared/nav-priority";
import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";

import type { RivieraRouteItem } from "./components/RouteNavigation";
import { CoverGate } from "./CoverGate";
import { rivieraBody, rivieraDisplay } from "./fonts";
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
import { ThemeStyles } from "./ThemeStyles";

type CobaltRouteCandidate = RivieraRouteItem & { section: NavSectionKey };

// Every candidate already uses a NavSectionKey, so none is remapped or dropped
// before the shared five-item priority picks the bottom-bar stops.
export function buildCobaltRouteItems(invitation: PublicInvitation): RivieraRouteItem[] {
  const { features } = invitation;
  const candidates: (CobaltRouteCandidate | null)[] = [
    { id: "cr-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "cr-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "cr-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "cr-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "cr-galeri", section: "gallery", label: "Galeri" } : null,
    features.rsvp ? { id: "cr-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "cr-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "cr-kado", section: "gift", label: "Kado" } : null,
  ];
  return pickNavItems(candidates.filter((item): item is CobaltRouteCandidate => item !== null));
}

export function CobaltRiviera({ invitation, guest }: ThemeComponentProps) {
  const {
    coupleDisplayName,
    guestDisplayName,
    primaryEvent,
    countdownTarget,
    calendarEvent,
    dressCode,
    heroImageUrl,
    closingImageUrl,
  } = buildThemeViewModel(invitation, guest);
  const routeItems = buildCobaltRouteItems(invitation);
  const finalGalleryImage = invitation.gallery.at(-1);
  const closingImage = finalGalleryImage?.imageUrl === closingImageUrl ? finalGalleryImage : null;
  const closingImageAlt = closingImage?.altText || closingImage?.caption || null;

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
          <HeroSection
            displayName={coupleDisplayName}
            eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
            guestDisplayName={guestDisplayName}
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
            timeZone={invitation.timeZone}
          />
          <CountdownSection
            target={countdownTarget}
            calendarEvent={calendarEvent}
            calendarUid={`${invitation.id}-${primaryEvent?.id ?? "main"}@invitation.digital`}
          />
          <DressCodeSection dressCode={dressCode} />
          {invitation.features.story ? <StorySection stories={invitation.stories} /> : null}
          {invitation.features.gallery ? (
            <GallerySection gallery={invitation.gallery} displayName={coupleDisplayName} />
          ) : null}
          <LivestreamSection events={invitation.events} enabled={invitation.features.livestream} />
          {invitation.features.rsvp ? (
            <RsvpSection
              invitationId={invitation.id}
              slug={invitation.slug}
              guestToken={guest?.token ?? null}
              guestName={guestDisplayName}
            />
          ) : null}
          {invitation.features.wishes ? (
            <WishesSection
              invitationId={invitation.id}
              slug={invitation.slug}
              guestToken={guest?.token ?? null}
              guestName={guestDisplayName}
              wishes={invitation.wishes}
            />
          ) : null}
          {invitation.features.gift ? <GiftSection gifts={invitation.gifts} /> : null}
          <ClosingSection
            displayName={coupleDisplayName}
            message={invitation.content.closingMessage}
            imageUrl={closingImageUrl}
            imageAlt={closingImageAlt}
          />
        </main>
      </CoverGate>
    </div>
  );
}
