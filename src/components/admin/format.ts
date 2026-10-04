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
