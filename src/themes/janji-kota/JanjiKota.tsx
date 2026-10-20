import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";
import { eventCopy } from "@/themes/shared/event-copy";
import { pickNavItems } from "@/themes/shared/nav-priority";
import { hasLivestreamLink } from "@/themes/shared/external-url";
import { buildThemeViewModel } from "@/themes/shared/view-model";

import { CoverGate } from "./CoverGate";
import type { NavItem } from "./components/FloatingNav";
import { ThemeStyles } from "./ThemeStyles";
import { labelFace, scriptFace, textFace } from "./fonts";
import { HeroSection } from "./sections/HeroSection";
import { QuoteSection } from "./sections/QuoteSection";
import { CoupleSection } from "./sections/CoupleSection";
import { StorySection } from "./sections/StorySection";
import { GallerySection } from "./sections/GallerySection";
import { ClosingSection } from "./sections/ClosingSection";
import { EventsSection } from "./sections/EventsSection";
import { CountdownSection } from "./sections/CountdownSection";
import { DressCodeSection } from "./sections/DressCodeSection";
import { LivestreamSection } from "./sections/LivestreamSection";
import { RsvpSection } from "./sections/RsvpSection";
import { WishesSection } from "./sections/WishesSection";
import { GiftSection } from "./sections/GiftSection";

/** Every section the guest can jump to, narrowed to the stops the invitation's package includes (DESIGN.md §12a). */
export function buildJanjiKotaNavItems(invitation: PublicInvitation): NavItem[] {
  const { features } = invitation;
  const candidates: (NavItem | null)[] = [
    { id: "jk-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "jk-mempelai", section: "couple", label: eventCopy(invitation.type).peopleNavLabel } : null,
    invitation.events.length > 0 ? { id: "jk-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "jk-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "jk-galeri", section: "gallery", label: "Galeri" } : null,
    features.livestream && hasLivestreamLink(invitation.events)
      ? { id: "jk-livestream", section: "livestream", label: "Live" }
      : null,
    features.rsvp ? { id: "jk-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "jk-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "jk-kado", section: "gift", label: "Kado" } : null,
  ];
  return pickNavItems(candidates.filter((item): item is NavItem => item !== null), invitation.navSections);
}

export function JanjiKota({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName, primaryEvent, countdownTarget, calendarEvent, dressCode, heroImageUrl, closingImageUrl } = buildThemeViewModel(invitation, guest);
  const navItems = buildJanjiKotaNavItems(invitation);
  const copy = eventCopy(invitation.type);
  const closingGalleryImage = invitation.gallery.at(-1);
  const closingImageAlt = closingGalleryImage?.imageUrl === closingImageUrl ? closingGalleryImage.altText : null;

  return (
    <div className={`jk-theme ${scriptFace.variable} ${labelFace.variable} ${textFace.variable}`} data-theme="janji-kota">
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        label={copy.coverEyebrow}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        navItems={navItems}
      >
        <HeroSection displayName={coupleDisplayName} imageUrl={heroImageUrl} message={invitation.content.openingMessage} />
        <QuoteSection quote={invitation.content.openingQuote} />
        <CoupleSection people={invitation.people} settings={invitation.theme.settings} invitationType={invitation.type} heading={copy.peopleHeading} />
        <EventsSection events={invitation.events} mapsEnabled={invitation.features.maps} timeZone={invitation.timeZone} />
        <CountdownSection
          target={countdownTarget}
          calendarEvent={calendarEvent}
          calendarUid={`${invitation.id}-${primaryEvent?.id ?? "main"}@invitation.digital`}
          heading={copy.countdownHeading}
        />
        <DressCodeSection dressCode={dressCode} />
        {invitation.features.story ? <StorySection stories={invitation.stories} heading={copy.storyHeading} /> : null}
        {invitation.features.gallery ? <GallerySection gallery={invitation.gallery} displayName={coupleDisplayName} /> : null}
        <LivestreamSection events={invitation.events} enabled={invitation.features.livestream} />
        {invitation.features.rsvp ? <RsvpSection invitationId={invitation.id} slug={invitation.slug} guestToken={guest?.token ?? null} guestName={guestDisplayName} /> : null}
        {invitation.features.wishes ? <WishesSection invitationId={invitation.id} slug={invitation.slug} guestToken={guest?.token ?? null} guestName={guestDisplayName} wishes={invitation.wishes} prompt={copy.wishesPrompt} timeZone={invitation.timeZone} /> : null}
        {invitation.features.gift ? <GiftSection gifts={invitation.gifts} intro={copy.giftIntro} /> : null}
        <ClosingSection displayName={coupleDisplayName} message={invitation.content.closingMessage} fallbackMessage={copy.closingLine} imageUrl={closingImageUrl} imageAlt={closingImageAlt} />
      </CoverGate>
    </div>
  );
}
