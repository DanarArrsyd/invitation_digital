function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function ExpiredState({
  displayName,
  eventDate,
}: {
  displayName: string;
  eventDate: string | null;
}) {
  const formattedDate = formatDate(eventDate);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FCFAF5] px-6 text-center">
      <p className="text-sm text-[#766453]">This invitation is no longer active.</p>
      <p className="font-serif text-2xl text-[#453B31]">{displayName}</p>
      {formattedDate ? <p className="text-sm text-[#766453]">{formattedDate}</p> : null}
    </main>
  );
}
