/**
 * Indonesian time zones an invitation's event times are entered in.
 * Indonesia observes no daylight saving, so each is a fixed UTC offset.
 */
export const INVITATION_TIME_ZONES = {
  "Asia/Jakarta": { label: "WIB", offsetHours: 7, region: "Sumatra, Jawa, Kalimantan Barat & Tengah" },
  "Asia/Makassar": { label: "WITA", offsetHours: 8, region: "Bali, Nusa Tenggara, Sulawesi, Kalimantan Selatan, Timur & Utara" },
  "Asia/Jayapura": { label: "WIT", offsetHours: 9, region: "Maluku & Papua" },
} as const;

export type InvitationTimeZone = keyof typeof INVITATION_TIME_ZONES;

export const DEFAULT_INVITATION_TIME_ZONE: InvitationTimeZone = "Asia/Jakarta";

export const INVITATION_TIME_ZONE_KEYS = Object.keys(INVITATION_TIME_ZONES) as InvitationTimeZone[];

export function isInvitationTimeZone(value: unknown): value is InvitationTimeZone {
  return typeof value === "string" && value in INVITATION_TIME_ZONES;
}

/** Reads `settings.timeZone`; anything missing or unknown is WIB, the original behaviour. */
export function resolveInvitationTimeZone(settings: unknown): InvitationTimeZone {
  const stored = settings && typeof settings === "object" ? (settings as { timeZone?: unknown }).timeZone : undefined;
  return isInvitationTimeZone(stored) ? stored : DEFAULT_INVITATION_TIME_ZONE;
}

export function timeZoneLabel(timeZone: InvitationTimeZone | undefined): string {
  return INVITATION_TIME_ZONES[timeZone ?? DEFAULT_INVITATION_TIME_ZONE].label;
}

export function timeZoneOffsetHours(timeZone: InvitationTimeZone | undefined): number {
  return INVITATION_TIME_ZONES[timeZone ?? DEFAULT_INVITATION_TIME_ZONE].offsetHours;
}
