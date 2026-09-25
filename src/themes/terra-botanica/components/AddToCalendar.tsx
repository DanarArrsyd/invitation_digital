"use client";

import { buildGoogleCalendarUrl, buildIcsCalendar, type CalendarEventInput } from "@/themes/shared/calendar";

export function AddToCalendar({ event, uid }: { event: CalendarEventInput; uid: string }) {
  function downloadIcs() {
    const content = buildIcsCalendar(event, uid, new Date());
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "event"}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tb-calendar-actions">
      <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" aria-label={`Google Kalender untuk ${event.title}`}>Google Kalender <span aria-hidden="true">↗</span></a>
      <button type="button" onClick={downloadIcs} aria-label={`Unduh kalender .ics untuk ${event.title}`}>Unduh kalender .ics <span aria-hidden="true">↓</span></button>
    </div>
  );
}
