export interface DressCodeGroup {
  label: string;
  colors: string[];
}

export interface DressCodeSettings {
  description: string | null;
  groups: DressCodeGroup[];
}

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  return HEX_PATTERN.test(trimmed) ? trimmed.toUpperCase() : null;
}

/** Comma/whitespace-separated hex list from a plain text field, e.g. "#2F4F4F, #1C2B33". */
export function parseHexColorList(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((v) => normalizeHexColor(v))
    .filter((v): v is string => v !== null)
    .slice(0, 6);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toGroup(value: unknown): DressCodeGroup | null {
  const raw = record(value);
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  const colors = Array.isArray(raw.colors)
    ? raw.colors.filter((c): c is string => typeof c === "string" && normalizeHexColor(c) !== null)
    : [];
  if (!label || colors.length === 0) return null;
  return { label, colors };
}

/** Reads `settings.dressCode`, the same invitation-settings JSON pattern used for person socials. */
export function getDressCode(settings: unknown): DressCodeSettings | null {
  const raw = record(settings).dressCode;
  if (!raw) return null;
  const source = record(raw);
  const description = typeof source.description === "string" && source.description.trim() ? source.description.trim() : null;
  const groups = Array.isArray(source.groups)
    ? source.groups.map(toGroup).filter((g): g is DressCodeGroup => g !== null)
    : [];
  if (!description && groups.length === 0) return null;
  return { description, groups };
}
