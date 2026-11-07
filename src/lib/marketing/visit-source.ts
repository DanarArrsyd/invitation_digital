import { cleanSourceValue, type VisitSource } from "./whatsapp";

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

/**
 * Returns the visit source as a stable string (for useSyncExternalStore).
 * A URL that carries utm_source wins and is remembered for the session;
 * pages without it reuse what was remembered.
 */
export function readVisitSourceSnapshot(): string | null {
  const params = new URLSearchParams(window.location.search);
  const source = cleanSourceValue(params.get("utm_source"));
  if (source) {
    const value = JSON.stringify({ source, campaign: cleanSourceValue(params.get("utm_campaign")) });
    if (readStored() !== value) store(value);
    return value;
  }
  return readStored();
}

export function parseVisitSource(snapshot: string | null): VisitSource | null {
  if (!snapshot) return null;
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!parsed || typeof parsed !== "object") return null;
    const { source, campaign } = parsed as Record<string, unknown>;
    const cleanSource = typeof source === "string" ? cleanSourceValue(source) : null;
    if (!cleanSource) return null;
    return { source: cleanSource, campaign: typeof campaign === "string" ? cleanSourceValue(campaign) : null };
  } catch {
    return null;
  }
}
