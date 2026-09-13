export interface InstagramProfile {
  username: string;
  url: string;
}

/** Accept a handle or HTTPS profile URL; never pass arbitrary URLs to the theme. */
export function normalizeInstagramProfile(value: unknown): InstagramProfile | null {
  if (typeof value !== "string") return null;
  let username = value.trim();
  if (username.startsWith("https://")) {
    try {
      const url = new URL(username);
      if (!["instagram.com", "www.instagram.com"].includes(url.hostname) || url.username || url.password || url.port) return null;
      const match = url.pathname.match(/^\/([a-zA-Z0-9._]+)\/?$/);
      if (!match) return null;
      username = match[1];
    } catch {
      return null;
    }
  } else {
    username = username.replace(/^@/, "");
  }
  if (!/^[a-zA-Z0-9_](?:[a-zA-Z0-9._]{0,28}[a-zA-Z0-9_])?$/.test(username) || username.includes("..")) return null;
  return { username, url: `https://www.instagram.com/${username}/` };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function getPersonInstagram(settings: unknown, personId: string): InstagramProfile | null {
  const person = record(record(record(settings).personSocials)[personId]);
  return normalizeInstagramProfile(person.instagram);
}
