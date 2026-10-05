export function usableExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Whether any event carries a livestream link a guest can open. */
export function hasLivestreamLink(events: readonly { livestreamUrl: string | null }[]): boolean {
  return events.some((event) => usableExternalUrl(event.livestreamUrl) !== null);
}
