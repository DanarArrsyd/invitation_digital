/** Types for content.mjs, so TypeScript (src/app/qa-matrix) reads it exactly. */

export interface DemoPerson {
  role: string;
  fullName: string;
  nickname: string;
  father: string;
  mother: string;
  bio: string;
}

export interface DemoEvent {
  type: string;
  title: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  address: string;
  livestream?: string;
}

export interface Demo {
  theme: string;
  sortOrder: number;
  tagline: string;
  description: string;
  title: string;
  eventDate: string;
  venue: string;
  type: string;
  eventTypes: string[];
  package_key: string;
  status: string;
  opening_quote: string | null;
  opening_message: string | null;
  closing_message: string | null;
  people: DemoPerson[];
  events: DemoEvent[];
  dressCode?: { description: string; groups: { label: string; colors: string[] }[] };
}

export const PALETTES: Record<string, [string, string, string][]>;
export const IMAGE_SLOTS: { file: string; width: number; height: number; aspectRatio?: string }[];
export function imagePath(theme: string, file: string): string;
export const DEMOS: Demo[];
export const STORIES: { title: string; year: string; description: string }[];
export const GIFTS: { type: string; provider: string; number: string; name: string }[];
export const WISHES: { name: string; message: string }[];
