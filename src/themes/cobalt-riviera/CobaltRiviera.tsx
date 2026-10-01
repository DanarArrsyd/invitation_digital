import { buildThemeViewModel } from "@/themes/shared/view-model";
import type { ThemeComponentProps } from "@/types/theme";

import { CeramicLine, RouteRule } from "./components/RivieraOrnaments";
import { Section } from "./components/Section";
import { SunMark } from "./components/SunMark";
import { rivieraBody, rivieraDisplay } from "./fonts";
import { ThemeStyles } from "./ThemeStyles";

export function CobaltRiviera({ invitation, guest }: ThemeComponentProps) {
  const { coupleDisplayName, guestDisplayName } = buildThemeViewModel(invitation, guest);

  return (
    <div
      className={`cr-theme ${rivieraDisplay.variable} ${rivieraBody.variable}`}
      data-theme="cobalt-riviera"
    >
      <ThemeStyles />
      <main id="cr-content">
        <Section id="cr-foundation" labelledBy="cr-foundation-title" tone="cobalt">
          <div className="cr-foundation-layout">
            <header className="cr-foundation-header">
              <p className="cr-kicker">Cobalt Riviera</p>
              <CeramicLine />
            </header>
            <div className="cr-foundation-copy">
              <h1 id="cr-foundation-title" className="cr-display">{coupleDisplayName}</h1>
              <RouteRule />
            </div>
            <footer className="cr-foundation-footer">
              <SunMark />
              {guestDisplayName ? <p className="cr-guest">{guestDisplayName}</p> : null}
            </footer>
          </div>
        </Section>
      </main>
    </div>
  );
}
