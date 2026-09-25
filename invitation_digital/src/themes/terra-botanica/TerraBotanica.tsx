import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";
import { buildThemeViewModel } from "@/themes/shared/view-model";

import { CoverGate } from "./CoverGate";
import type { NavItem } from "./components/FloatingNav";
import { ThemeStyles } from "./ThemeStyles";
import { bodySans, displaySerif } from "./fonts";
import { HeroSection } from "./sections/HeroSection";
import { QuoteSection } from "./sections/QuoteSection";
import { CoupleSection } from "./sections/CoupleSection";
import { StorySection } from "./sections/StorySection";
import { GallerySection } from "./sections/GallerySection";
import { ClosingSection } from "./sections/ClosingSection";

export function buildTerraNavItems(invitation: PublicInvitation): NavItem[] {
  const { features } = invitation;
  const candidates: (NavItem | null)[] = [
    { id: "tb-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "tb-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "tb-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "tb-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "tb-galeri", section: "gallery", label: "Galeri" } : null,
    features.rsvp ? { id: "tb-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "tb-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "tb-kado", section: "gift", label: "Kado" } : null,
  ];
  return candidates.filter((item): item is NavItem => item !== null);
}

export function TerraBotanica({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName, primaryEvent, heroImageUrl, closingImageUrl } = buildThemeViewModel(invitation, guest);
  // Expand alongside the actual sections in subsequent tasks, never ahead of them.
  const navItems = buildTerraNavItems(invitation).filter((item) => ["hero", "couple", "story", "gallery"].includes(item.section));

  return (
    <div className={`tb-theme ${displaySerif.variable} ${bodySans.variable}`}>
      <ThemeStyles />
      <CoverGate
        invitationId={invitation.id}
        guestToken={guest?.token ?? null}
        label={invitation.type === "wedding" ? "The Wedding Journal" : "Undangan"}
        displayName={coupleDisplayName}
        eventDate={invitation.eventDate ?? primaryEvent?.eventDate ?? null}
        guestDisplayName={guestDisplayName}
        musicEnabled={invitation.features.music}
        musicUrl={invitation.media.musicUrl}
        navItems={navItems}
      >
        <HeroSection displayName={coupleDisplayName} imageUrl={heroImageUrl} message={invitation.content.openingMessage} />
        <QuoteSection quote={invitation.content.openingQuote} />
        <CoupleSection people={invitation.people} settings={invitation.theme.settings} invitationType={invitation.type} />
        {invitation.features.story ? <StorySection stories={invitation.stories} /> : null}
        {invitation.features.gallery ? <GallerySection gallery={invitation.gallery} displayName={coupleDisplayName} /> : null}
        <ClosingSection displayName={coupleDisplayName} message={invitation.content.closingMessage} imageUrl={closingImageUrl} imageAlt={invitation.gallery.at(-1)?.altText ?? null} />
      </CoverGate>
    </div>
  );
}
