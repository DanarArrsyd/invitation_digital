import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { PublicInvitation } from "@/types/invitation";
import type { ThemeComponentProps } from "@/types/theme";

import type { RivieraRouteItem } from "./components/RouteNavigation";
import { CoverGate } from "./CoverGate";
import { rivieraBody, rivieraDisplay } from "./fonts";
import { ClosingSection } from "./sections/ClosingSection";
import { CoupleSection } from "./sections/CoupleSection";
import { HeroSection } from "./sections/HeroSection";
import { QuoteSection } from "./sections/QuoteSection";
import { ThemeStyles } from "./ThemeStyles";

export function buildCobaltRouteItems(invitation: PublicInvitation): RivieraRouteItem[] {
  const { features } = invitation;
  const candidates: (RivieraRouteItem | null)[] = [
    { id: "cr-beranda", section: "hero", label: "Beranda" },
    invitation.people.length > 0 ? { id: "cr-mempelai", section: "couple", label: "Mempelai" } : null,
    invitation.events.length > 0 ? { id: "cr-acara", section: "events", label: "Acara" } : null,
    features.story && invitation.stories.length > 0 ? { id: "cr-cerita", section: "story", label: "Cerita" } : null,
    features.gallery && invitation.gallery.length > 0 ? { id: "cr-galeri", section: "gallery", label: "Galeri" } : null,
    features.rsvp ? { id: "cr-rsvp", section: "rsvp", label: "RSVP" } : null,
    features.wishes ? { id: "cr-ucapan", section: "wishes", label: "Ucapan" } : null,
    features.gift && invitation.gifts.length > 0 ? { id: "cr-kado", section: "gift", label: "Kado" } : null,
  ];
  return candidates.filter((item): item is RivieraRouteItem => item !== null);
}

export function CobaltRiviera({ invitation, guest }: ThemeComponentProps) {
  const {
    coupleDisplayName,
    guestDisplayName,
    primaryEvent,
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
