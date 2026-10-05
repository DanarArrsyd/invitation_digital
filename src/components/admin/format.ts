/** `event_date` is a plain date; format it in UTC so no viewer timezone shifts the day. */
export function formatEventDate(date: string | null): string {
  if (!date) return "Tanggal belum diatur";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

/** A timestamp shown as a date in Jakarta time. */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
}

/** Days from today (Jakarta) to an event date, e.g. "H-12", "Hari H", "Selesai". */
export function eventCountdownLabel(date: string | null, now = new Date()): string | null {
  if (!date) return null;
  const today = new Date(`${now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}T00:00:00Z`);
  const days = Math.round((new Date(`${date}T00:00:00Z`).getTime() - today.getTime()) / 86_400_000);
  if (Number.isNaN(days)) return null;
  if (days > 0) return `H-${days}`;
  if (days === 0) return "Hari H";
  return "Selesai";
}

/** A full event date with the weekday, e.g. "Sabtu, 16 Oktober 2027". */
export function formatLongEventDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
