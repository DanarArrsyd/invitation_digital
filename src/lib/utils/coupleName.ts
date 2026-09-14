/**
 * The `invitation.title` field is an internal/admin label (e.g. "The Wedding
 * of Rayhana & Febri") — displaying it verbatim on the cover (or an expired
 * state) next to a "THE WEDDING OF" eyebrow duplicates that phrase. Prefer
 * the bride/groom names when available, per DESIGN.md section 7's cover
 * hierarchy. Shared (not theme-specific) since both the theme and the public
 * loader's expired-state summary need it.
 */
export function getCoupleDisplayName(
  people: { role: string; nickname: string | null; fullName: string }[],
  fallbackTitle: string,
): string {
  const bride = people.find((p) => p.role === "bride");
  const groom = people.find((p) => p.role === "groom");

  if (bride && groom) {
    return `${bride.nickname || bride.fullName} & ${groom.nickname || groom.fullName}`;
  }

  return fallbackTitle;
}

/**
 * Two-letter monogram ("R" + "F") for the couple's signature badge. Only
 * meaningful for the bride & groom pair shape — returns null for anything
 * that isn't exactly two names joined by "&" (e.g. the fallback title, or
 * event types without a couple), so callers can skip the badge entirely
 * rather than render a monogram from unrelated text.
 */
export function getCoupleInitials(displayName: string): [string, string] | null {
  const parts = displayName.split(/\s+&\s+/);
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b) return null;
  return [a.charAt(0).toUpperCase(), b.charAt(0).toUpperCase()];
}
