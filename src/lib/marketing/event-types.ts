/** Invitation types (see invitations.type) in the order the marketing site shows them. */
export const EVENT_TYPES = ["wedding", "engagement", "birthday", "aqiqah", "graduation", "corporate"] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Pernikahan",
  engagement: "Lamaran",
  birthday: "Ulang tahun",
  aqiqah: "Aqiqah",
  graduation: "Wisuda",
  corporate: "Acara kantor",
};

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && (EVENT_TYPES as readonly string[]).includes(value);
}
