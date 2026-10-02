/** `iso` is the plain event date (YYYY-MM-DD); format in UTC so no viewer timezone shifts it. */
function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

/** Theme-agnostic screen for an invitation whose viewing period has ended. */
export function ExpiredState({
  displayName,
  eventDate,
}: {
  displayName: string;
  eventDate: string | null;
}) {
  const formattedDate = formatDate(eventDate);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-[#FCFAF5] px-6 text-center">
      <p className="text-sm text-[#665645]">Masa berlaku undangan ini sudah berakhir.</p>
      <p className="font-serif text-3xl text-[#2A2219]">{displayName}</p>
      {formattedDate ? <p className="text-sm text-[#665645]">{formattedDate}</p> : null}
      <p className="mt-4 max-w-xs text-sm text-[#665645]">
        Terima kasih atas doa dan perhatian Anda.
      </p>
    </main>
  );
}
