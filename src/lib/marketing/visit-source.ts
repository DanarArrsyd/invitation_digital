import { cleanSourceValue, parseSocialSource, type VisitSource } from "./whatsapp";

const STORAGE_KEY = "temuraya:visit-source";

function readStored(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(value: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode or blocked storage: the source just lasts for this page.
  }
}

function remember(value: string): string {
  if (readStored() !== value) store(value);
  return value;
}

/**
 * Returns the visit source as a stable string (for useSyncExternalStore).
 * A URL with an allowed `?src=` (tiktok, instagram) wins, then utm_source;
 * either is remembered for the session. Pages without one reuse what was
 * remembered. Any other `?src=` value is ignored.
 */
export function readVisitSourceSnapshot(): string | null {
  const params = new URLSearchParams(window.location.search);
  const social = parseSocialSource(params.get("src"));
  if (social) return remember(JSON.stringify({ source: social, campaign: null, fromSrc: true }));
  const source = cleanSourceValue(params.get("utm_source"));
  if (source) {
    return remember(JSON.stringify({ source, campaign: cleanSourceValue(params.get("utm_campaign")) }));
  }
  return readStored();
}

export function parseVisitSource(snapshot: string | null): VisitSource | null {
  if (!snapshot) return null;
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!parsed || typeof parsed !== "object") return null;
    const { source, campaign, fromSrc } = parsed as Record<string, unknown>;
    if (fromSrc === true) {
      const social = typeof source === "string" ? parseSocialSource(source) : null;
      return social ? { source: social, campaign: null, fromSrc: true } : null;
    }
    const cleanSource = typeof source === "string" ? cleanSourceValue(source) : null;
    if (!cleanSource) return null;
    return { source: cleanSource, campaign: typeof campaign === "string" ? cleanSourceValue(campaign) : null };
  } catch {
    return null;
  }
}
