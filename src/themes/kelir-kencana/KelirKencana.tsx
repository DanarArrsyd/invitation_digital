import { pickNavItems, type NavSectionKey } from "@/themes/shared/nav-priority";
import { hasLivestreamLink } from "@/themes/shared/external-url";
import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { InvitationType, PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";

import type { KelirRouteItem } from "./components/RouteNavigation";
import { CoverGate } from "./CoverGate";
import { kelirBody, kelirDisplay, kelirScript } from "./fonts";
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

type KelirRouteCandidate = KelirRouteItem & { section: NavSectionKey };

const EVENT_NAMES: Record<InvitationType, string> = {
  wedding: "Pernikahan",
  engagement: "Lamaran",
  birthday: "Ulang Tahun",
  aqiqah: "Tasyakuran Aqiqah",
  graduation: "Wisuda",
  corporate: "Perayaan",
};

// Every candidate already uses a NavSectionKey, so none is remapped or dropped
// before the package's stop list (themes/shared/nav-priority) picks the bar.
export function buildKelirRouteItems(invitation: PublicInvitation): KelirRouteItem[] {
  const { features } = invitation;
  const candidates: (KelirRouteCandidate | null)[] = [
    { id: "kk-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "kk-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "kk-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "kk-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "kk-galeri", section: "gallery", label: "Galeri" } : null,
    features.livestream && hasLivestreamLink(invitation.events)
      ? { id: "kk-livestream", section: "livestream", label: "Streaming" }
      : null,
    features.rsvp ? { id: "kk-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "kk-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "kk-kado", section: "gift", label: "Kado" } : null,
  ];
  return pickNavItems(candidates.filter((item): item is KelirRouteCandidate => item !== null), invitation.navSections);
}

export function KelirKencana({ invitation, guest }: ThemeComponentProps) {
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
  const routeItems = buildKelirRouteItems(invitation);
  const finalGalleryImage = invitation.gallery.at(-1);
  const closingImage = finalGalleryImage?.imageUrl === closingImageUrl ? finalGalleryImage : null;
  const closingImageAlt = closingImage?.altText || closingImage?.caption || null;
  const eventName = EVENT_NAMES[invitation.type] ?? "Perayaan";
  const eventDate = invitation.eventDate ?? primaryEvent?.eventDate ?? null;

  return (
    <div
      className={`kk-theme ${kelirScript.variable} ${kelirDisplay.variable} ${kelirBody.variable}`}
      data-theme="kelir-kencana"
    >
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        intro={`Pagelaran ${eventName}`}
        displayName={coupleDisplayName}
        eventDate={eventDate}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        routeItems={routeItems}
      >
        <main>
          <HeroSection
            eyebrow={invitation.type === "wedding" ? "The Wedding Of" : eventName}
            displayName={coupleDisplayName}
            eventDate={eventDate}
            venueSummary={invitation.venueSummary}
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
