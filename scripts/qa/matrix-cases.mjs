/**
 * Cases and checks for the template QA matrix (scripts/qa/matrix.mjs).
 * Pure: no browser, so tests/qa-matrix-cases.test.mjs can pin the matrix
 * and every check. Viewports and rules follow docs/DESIGN.md §28.7.
 */
import { DEMOS } from "../demo/content.mjs";

export const THEMES = DEMOS.map((demo) => demo.theme);
export const PACKAGES = ["intimate", "signature", "grand"];
export const TYPES = ["wedding", "birthday", "engagement", "aqiqah", "graduation", "corporate"];
export const CONDITIONS = ["lengkap", "minim", "panjang"];
export const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
];

/** Section anchor suffixes from docs/DESIGN.md §28.2, keyed by NavSectionKey. */
export const NAV_ANCHOR_SUFFIX = {
  hero: "beranda",
  couple: "mempelai",
  events: "acara",
  story: "cerita",
  gallery: "galeri",
  livestream: "livestream",
  rsvp: "rsvp",
  wishes: "ucapan",
  gift: "kado",
};

const WEDDING_ONLY = [/mempelai/i, /the wedding of/i, /pernikahan/i];
// Turnstile rejects localhost (error 110200) and Chrome echoes each failed
// response as a URL-less console line; the app's own failed requests are
// still reported with their URL below.
const CONSOLE_NOISE = [/\[Cloudflare Turnstile\]/, /^Failed to load resource:/];
const PHONE_MAX_WIDTH = 767;
const MIN_NAV_ITEM_HEIGHT = 52;

function makeCase(theme, { paket = "signature", jenis = "wedding", kondisi = "lengkap", guest = "default", viewport, reducedMotion = false }) {
  const id = [theme, paket, jenis, kondisi, guest, viewport.name, reducedMotion ? "rm" : null].filter(Boolean).join("__");
  return { id, theme, paket, jenis, kondisi, guest, viewport, reducedMotion };
}

export function buildCases({ full = false, theme, viewport } = {}) {
  if (theme && !THEMES.includes(theme)) throw new Error(`Unknown theme "${theme}". Known: ${THEMES.join(", ")}`);
  const themes = theme ? [theme] : THEMES;
  const phone = VIEWPORTS[1];
  const cases = [];

  for (const slug of themes) {
    if (full) {
      for (const paket of PACKAGES) for (const jenis of TYPES) for (const kondisi of CONDITIONS) for (const vp of VIEWPORTS) {
        cases.push(makeCase(slug, { paket, jenis, kondisi, viewport: vp }));
      }
      continue;
    }
    for (const paket of PACKAGES) for (const vp of VIEWPORTS) cases.push(makeCase(slug, { paket, viewport: vp }));
    for (const jenis of TYPES.filter((t) => t !== "wedding")) cases.push(makeCase(slug, { jenis, viewport: phone }));
    for (const kondisi of CONDITIONS.filter((k) => k !== "lengkap")) cases.push(makeCase(slug, { kondisi, viewport: phone }));
    cases.push(makeCase(slug, { guest: "none", viewport: phone }));
    cases.push(makeCase(slug, { viewport: phone, reducedMotion: true }));
  }

  return viewport ? cases.filter((c) => c.viewport.name === viewport) : cases;
}

export function caseUrl(baseUrl, c) {
  const query = new URLSearchParams({ paket: c.paket, jenis: c.jenis, kondisi: c.kondisi });
  if (c.guest === "none") query.set("to", "none");
  return `${baseUrl.replace(/\/$/, "")}/qa-matrix/${c.theme}?${query}`;
}

export function evaluate(c, probe) {
  const failures = [];
  if (probe.scrollWidth > probe.innerWidth) failures.push(`horizontal overflow: ${probe.scrollWidth}px > ${probe.innerWidth}px`);
  for (const error of probe.consoleErrors) {
    if (!CONSOLE_NOISE.some((pattern) => pattern.test(error))) failures.push(`console error: ${error}`);
  }
  for (const request of probe.failedRequests) {
    if (!probe.origin || request.startsWith(probe.origin)) failures.push(`failed request: ${request}`);
  }
  for (const src of probe.brokenImages) failures.push(`image failed: ${src}`);
  if (!probe.openButtonVisible) failures.push('"Buka Undangan" is not inside the first viewport');

  const expected = probe.navSections.filter((key) => probe.presentSections.includes(key));
  if (probe.navLabels.length !== expected.length) {
    failures.push(`nav shows ${probe.navLabels.length} stops, expected ${expected.length} (${expected.join(", ")})`);
  }
  if (c.viewport.width <= PHONE_MAX_WIDTH) {
    const short = probe.navItemHeights.filter((height) => height < MIN_NAV_ITEM_HEIGHT);
    if (short.length) failures.push(`${short.length} nav item(s) shorter than ${MIN_NAV_ITEM_HEIGHT}px`);
  }
  for (const label of probe.cutLabels) failures.push(`nav label cut: ${label}`);
  if (c.jenis !== "wedding") {
    for (const pattern of WEDDING_ONLY) {
      const match = probe.bodyText.match(pattern);
      if (match) failures.push(`wedding-only copy on a ${c.jenis} page: "${match[0]}"`);
    }
  }
  return failures;
}
