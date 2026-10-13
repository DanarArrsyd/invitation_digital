import type { InvitationType, PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";
import { eventCopy } from "@/themes/shared/event-copy";
import { pickNavItems } from "@/themes/shared/nav-priority";
import { hasLivestreamLink } from "@/themes/shared/external-url";
import { buildThemeViewModel } from "@/themes/shared/view-model";

import { CoverGate } from "./CoverGate";
import type { NavItem } from "./components/FloatingNav";
import { GrowingVine } from "./components/GrowingVine";
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

// Each type's cover carries its own Latin plant name, after the wedding's
// Rosa amoris: a promise rose, a birthday sunflower, a newborn lily, the
// graduate's laurel and the firm's oak.
const SPECIMENS: Record<InvitationType, string> = {
  wedding: "Rosa amoris",
  engagement: "Rosa promissa",
  birthday: "Helianthus natalis",
  aqiqah: "Lilium novum",
  graduation: "Laurus nobilis",
  corporate: "Quercus robur",
};

/** Every section the guest can jump to, narrowed to the stops the invitation's package includes (DESIGN.md §12a). */
export function buildTerraNavItems(invitation: PublicInvitation): NavItem[] {
  const { features } = invitation;
  const candidates: (NavItem | null)[] = [
    { id: "tb-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "tb-mempelai", section: "couple", label: eventCopy(invitation.type).peopleNavLabel } : null,
    invitation.events.length > 0 ? { id: "tb-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "tb-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "tb-galeri", section: "gallery", label: "Galeri" } : null,
    features.livestream && hasLivestreamLink(invitation.events)
      ? { id: "tb-livestream", section: "livestream", label: "Live" }
      : null,
    features.rsvp ? { id: "tb-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "tb-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "tb-kado", section: "gift", label: "Kado" } : null,
  ];
  return pickNavItems(candidates.filter((item): item is NavItem => item !== null), invitation.navSections);
}

export function TerraBotanica({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName, primaryEvent, countdownTarget, calendarEvent, dressCode, heroImageUrl, closingImageUrl } = buildThemeViewModel(invitation, guest);
  const navItems = buildTerraNavItems(invitation);
  const copy = eventCopy(invitation.type);

  return (
    <div className={`tb-theme ${scriptFace.variable} ${labelFace.variable} ${textFace.variable}`}>
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        label={invitation.type === "wedding" ? "The Wedding Journal" : copy.coverEyebrow}
        specimen={SPECIMENS[invitation.type] ?? SPECIMENS.corporate}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        navItems={navItems}
      >
        <GrowingVine />
        <HeroSection displayName={coupleDisplayName} imageUrl={heroImageUrl} message={invitation.content.openingMessage} />
        <QuoteSection quote={invitation.content.openingQuote} />
        <CoupleSection people={invitation.people} settings={invitation.theme.settings} invitationType={invitation.type} heading={copy.peopleHeading} />
        <EventsSection events={invitation.events} mapsEnabled={invitation.features.maps} timeZone={invitation.timeZone} />
        <CountdownSection
          target={countdownTarget}
          calendarEvent={calendarEvent}
          calendarUid={`${invitation.id}-${primaryEvent?.id ?? "main"}@invitation.digital`}
        />
        <DressCodeSection dressCode={dressCode} />
        {invitation.features.story ? <StorySection stories={invitation.stories} heading={copy.storyHeading} /> : null}
        {invitation.features.gallery ? <GallerySection gallery={invitation.gallery} displayName={coupleDisplayName} /> : null}
        <LivestreamSection events={invitation.events} enabled={invitation.features.livestream} />
        {invitation.features.rsvp ? <RsvpSection invitationId={invitation.id} slug={invitation.slug} guestToken={guest?.token ?? null} guestName={guestDisplayName} /> : null}
        {invitation.features.wishes ? <WishesSection invitationId={invitation.id} slug={invitation.slug} guestToken={guest?.token ?? null} guestName={guestDisplayName} wishes={invitation.wishes} prompt={copy.wishesPrompt} /> : null}
        {invitation.features.gift ? <GiftSection gifts={invitation.gifts} intro={copy.giftIntro} /> : null}
        <ClosingSection displayName={coupleDisplayName} message={invitation.content.closingMessage} imageUrl={closingImageUrl} imageAlt={invitation.gallery.at(-1)?.altText ?? null} />
      </CoverGate>
    </div>
  );
}
