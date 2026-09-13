import type { Guest, PublicInvitation } from "@/types/invitation";

import { themeRegistry } from "./registry";
import { UnsupportedTheme } from "./UnsupportedTheme";

/**
 * Single resolution point for theme slug -> component. Routes/pages must
 * never branch on theme slug themselves — see ARCHITECTURE.md section 6.
 */
export function ThemeRenderer({
  invitation,
  guest,
}: {
  invitation: PublicInvitation;
  guest: Guest | null;
}) {
  const themeDefinition = themeRegistry[invitation.theme.slug];

  if (!themeDefinition) {
    return <UnsupportedTheme themeSlug={invitation.theme.slug} />;
  }

  const Theme = themeDefinition.component;

  return <Theme invitation={invitation} guest={guest} />;
}
