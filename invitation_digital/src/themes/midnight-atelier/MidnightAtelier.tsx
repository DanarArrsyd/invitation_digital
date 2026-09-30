import type { ThemeComponentProps } from "@/types/theme";
import { buildThemeViewModel } from "@/themes/shared/view-model";

import { AtelierMark } from "./components/AtelierMark";
import { Section } from "./components/Section";
import { bodyCondensed, displaySerif } from "./fonts";
import { ThemeStyles } from "./ThemeStyles";

export function MidnightAtelier({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName } = buildThemeViewModel(invitation, guest);

  return (
    <div
      className={`ma-theme ${displaySerif.variable} ${bodyCondensed.variable}`}
      data-theme="midnight-atelier"
    >
      <ThemeStyles />
      <main id="ma-content">
        <Section id="ma-foundation" labelledBy="ma-foundation-title">
          <div className="ma-foundation-layout">
            <div className="ma-foundation-copy">
              <p className="ma-eyebrow">Midnight Atelier</p>
              <h1 id="ma-foundation-title" className="ma-display">{coupleDisplayName}</h1>
            </div>
            <AtelierMark />
            {guestDisplayName ? <p className="ma-guest">{guestDisplayName}</p> : null}
          </div>
        </Section>
      </main>
    </div>
  );
}
