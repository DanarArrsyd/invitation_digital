import assert from "node:assert/strict";
import test from "node:test";

import { buildCases, caseUrl, evaluate, THEMES, VIEWPORTS } from "../scripts/qa/matrix-cases.mjs";

test("the core matrix is 126 unique pages over the §28.7 viewports", () => {
  const cases = buildCases();
  assert.equal(cases.length, 126);
  assert.equal(new Set(cases.map((c) => c.id)).size, 126);
  assert.deepEqual(VIEWPORTS.map((v) => `${v.width}x${v.height}`), ["320x568", "375x812", "768x1024", "1280x800"]);
  assert.equal(THEMES.length, 6);
  for (const theme of THEMES) {
    const own = cases.filter((c) => c.theme === theme);
    assert.equal(own.filter((c) => c.jenis !== "wedding").length, 5, `${theme}: every other type`);
    assert.equal(own.filter((c) => c.guest === "none").length, 1);
    assert.equal(own.filter((c) => c.reducedMotion).length, 1);
  }
});

test("the full matrix and the filters", () => {
  assert.equal(buildCases({ full: true }).length, 1296);
  assert.ok(buildCases({ theme: "kelir-kencana" }).every((c) => c.theme === "kelir-kencana"));
  assert.ok(buildCases({ viewport: "320" }).every((c) => c.viewport.width === 320));
  assert.throws(() => buildCases({ theme: "nope" }), /Unknown theme/);
});

test("caseUrl carries every parameter and drops the default guest", () => {
  const [first] = buildCases({ theme: "terra-botanica" });
  assert.equal(caseUrl("http://localhost:3000", first), "http://localhost:3000/qa-matrix/terra-botanica?paket=intimate&jenis=wedding&kondisi=lengkap");
  const noGuest = buildCases({ theme: "terra-botanica" }).find((c) => c.guest === "none");
  assert.match(caseUrl("http://localhost:3000", noGuest), /&to=none$/);
});

const phone = { id: "x", theme: "terra-botanica", paket: "signature", jenis: "wedding", kondisi: "lengkap", guest: "default", viewport: VIEWPORTS[1], reducedMotion: false };
const clean = {
  scrollWidth: 375, innerWidth: 375, consoleErrors: [], failedRequests: [], brokenImages: [], openButtonVisible: true,
  navSections: ["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"],
  presentSections: ["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"],
  navLabels: ["Beranda", "Mempelai", "Acara", "Galeri", "RSVP", "Ucapan", "Kado"],
  navItemHeights: [56, 56, 56, 56, 56, 56, 56], cutLabels: [], bodyText: "Mempelai",
};

test("a clean page passes; sections without content are not expected in the nav", () => {
  assert.deepEqual(evaluate(phone, clean), []);
  const sparse = { ...clean, presentSections: clean.presentSections.filter((key) => key !== "rsvp"), navLabels: clean.navLabels.filter((label) => label !== "RSVP") };
  assert.deepEqual(evaluate({ ...phone, kondisi: "minim" }, sparse), []);
});

test("each check reports its own failure", () => {
  const failures = evaluate({ ...phone, jenis: "birthday" }, {
    ...clean, scrollWidth: 400, consoleErrors: ["boom"], failedRequests: ["/x (HTTP 404)"], brokenImages: ["/a.jpg"],
    openButtonVisible: false, navLabels: ["Beranda"], navItemHeights: [40], cutLabels: ["Mempelai"], bodyText: "The Wedding Of Sekar",
  });
  for (const pattern of [/horizontal overflow/, /console error: boom/, /failed request/, /image failed/, /Buka Undangan/,
    /nav shows 1 stops, expected 7/, /shorter than 52px/, /nav label cut/, /wedding-only copy on a birthday page/]) {
    assert.ok(failures.some((f) => pattern.test(f)), `missing ${pattern}`);
  }
});

test("the 52px rule applies to phones only", () => {
  const desktop = { ...phone, viewport: VIEWPORTS[3] };
  assert.deepEqual(evaluate(desktop, { ...clean, scrollWidth: 1280, innerWidth: 1280, navItemHeights: [40] }), []);
});

test("third-party noise is ignored; the app's own failures still count", () => {
  const noisy = {
    ...clean,
    origin: "http://localhost:3000",
    consoleErrors: ["[Cloudflare Turnstile] Error: 110200.", "Failed to load resource: the server responded with a status of 400 ()", "TypeError: x is undefined"],
    failedRequests: ["https://challenges.cloudflare.com/cdn-cgi/x (HTTP 400)", "http://localhost:3000/_next/image?url=%2Fdemo%2Fa.jpg (HTTP 404)"],
  };
  const failures = evaluate(phone, noisy);
  assert.deepEqual(failures, [
    "console error: TypeError: x is undefined",
    "failed request: http://localhost:3000/_next/image?url=%2Fdemo%2Fa.jpg (HTTP 404)",
  ]);
});

test("with full data every section the tier promises must render", () => {
  const full = { ...clean, presentSections: [...clean.navSections], navLabels: clean.navSections.map(String) };
  assert.deepEqual(evaluate(phone, full), []);
  const missing = evaluate(phone, { ...full, presentSections: full.presentSections.filter((key) => key !== "gallery"), navLabels: full.navLabels.slice(1) });
  assert.ok(missing.some((failure) => /tier promises gallery but the page has no -galeri section/.test(failure)), missing.join("\n"));
});

test("an unknown viewport is a usage error, not an empty matrix", () => {
  assert.throws(() => buildCases({ viewport: "360" }), /Unknown viewport "360". Known: 320, 375, 768, 1280/);
});
