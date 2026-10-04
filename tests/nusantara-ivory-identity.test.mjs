import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const ivoryRoot = resolve(srcRoot, "themes/nusantara-ivory");

const OPENED_COVER = {
  opened: true, playing: false, canPlayMusic: false, reducedMotion: false,
  audioRef: { current: null }, contentRef: { current: null },
  openInvitation: () => {}, toggleMusic: () => {},
};

/** Loads theme TS/TSX through vm. `cover` replaces useInvitationCover's result; `reducedMotion` forces Motion's preference. */
function createLoader({ cover = OPENED_COVER, reducedMotion = false } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
    assert.ok(path, `Missing module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get navigator() { return globalThis.navigator; },
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return { trackCoverOpenedAction: async () => {}, submitRsvpAction: async () => ({ status: "idle" }), submitWishAction: async () => ({ status: "idle" }) };
        }
        if (name === "@/themes/shared/use-invitation-cover") return { useInvitationCover: () => cover };
        if (name === "motion/react" && reducedMotion) return { ...nodeRequire("motion/react"), useReducedMotion: () => true };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(ivoryRoot, relative));
}

async function mount(element) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = {
    window: globalThis.window, document: globalThis.document,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, { window: prior.window, document: prior.document, IS_REACT_ACT_ENVIRONMENT: prior.IS_REACT_ACT_ENVIRONMENT });
      if (prior.navigator) Object.defineProperty(globalThis, "navigator", prior.navigator);
      dom.window.close();
    },
  };
}

function invitation(overrides = {}) {
  return {
    id: "ivory", type: "wedding", slug: "ivory", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Ubud", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "nusantara-ivory", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya Putri", nickname: "Alya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima Satria", nickname: "Bima", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Ubud", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: false, gallery: false, dressCode: false,
      livestream: false, rsvp: false, wishes: false, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test("the Surat dari Keraton palette keeps every text pair at WCAG AA", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const token = Object.fromEntries([...styles.matchAll(/--ni-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  assert.equal(token.ivory, "#F8F1E4");
  assert.equal(token.sogan, "#6B3E26");
  assert.equal(token.bata, "#7A2E22");
  assert.equal(token.hijau, "#2F4A3A");
  assert.equal(token.gold, "#A87A3D");
  for (const [fg, bg, min] of [
    ["ink", "ivory", 7], ["brown", "ivory", 4.5], ["brown-soft", "ivory", 4.5], ["brown-soft", "cream", 4.5],
    ["gold-ink", "ivory", 4.5], ["gold-ink", "cream", 4.5], ["gold-ink", "cream-edge", 4.5], ["brown-soft", "cream-edge", 4.5], ["danger", "ivory", 4.5],
    ["gold-soft", "espresso", 4.5], ["ivory-2", "espresso", 4.5],
  ]) {
    assert.ok(contrast(token[fg], token[bg]) >= min, `--ni-${fg} on --ni-${bg} is ${contrast(token[fg], token[bg]).toFixed(2)}`);
  }
});

test("the Ivory watermark is a drawn kawung pattern", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const lattice = styles.match(/\.ni-lattice::before \{[\s\S]*?\n\}/)[0];
  assert.equal((lattice.match(/%3Cellipse/g) ?? []).length, 4, "four kawung petals per tile");
  assert.doesNotMatch(lattice, /\.png|\.jpg/);
});

test("couple names use the script face and section titles stay in Cinzel", () => {
  const { NusantaraIvory } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(NusantaraIvory, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  const scripts = [...document.querySelectorAll(".ni-script")].map((node) => node.textContent.trim());
  assert.ok(scripts.includes("Alya & Bima"), "hero names");
  assert.ok(scripts.includes("Alya") && scripts.includes("Bima"), "couple names");
  assert.ok(document.querySelector("#ni-beranda h1.ni-script"), "hero h1 is script");
  const titles = [...document.querySelectorAll("h2")];
  assert.ok(titles.length > 0);
  for (const title of titles) {
    assert.ok(!title.classList.contains("ni-script"), `section title "${title.textContent}" must not be script`);
  }
  const closingScript = document.querySelector(".ni-panel-dark .ni-script");
  assert.ok(closingScript, "closing panel carries a script title");
  assert.equal(closingScript.textContent.trim(), "Alya & Bima");
  assert.match(document.body.textContent, /Matur Nuwun · Terima Kasih/, "closing carries the Javanese thanks");
});

test("the cover is a two-leaf gunungan gate that opens in the same tap", async () => {
  let opens = 0;
  const cover = { ...OPENED_COVER, opened: false, openInvitation: () => { opens += 1; } };
  const { CoverGate } = createLoader({ cover })("CoverGate");
  const view = await mount(React.createElement(CoverGate, {
    invitationId: "ivory", guestToken: null, eyebrow: "The Wedding Of", displayName: "Alya & Bima",
    eventDate: "2030-10-20", guestDisplayName: "Bude Sri", musicUrl: null, musicEnabled: false, navItems: [],
  }, React.createElement("p", null, "isi")));
  try {
    const leaves = view.document.querySelectorAll("[data-ni-gate-leaf]");
    assert.equal(leaves.length, 2);
    for (const leaf of leaves) {
      assert.equal(leaf.getAttribute("aria-hidden"), "true");
      assert.ok(leaf.querySelector("svg.ni-gate-gunungan"), "each leaf carries half of the gunungan");
    }
    assert.match(view.document.querySelector("h1.ni-script").textContent, /Alya/);
    assert.match(view.document.body.textContent, /Bude Sri/);
    const button = [...view.document.querySelectorAll("button")].find((node) => node.textContent.trim() === "Buka Undangan");
    assert.ok(button, "the cover keeps a real Buka Undangan button");
    await act(async () => button.click());
    assert.equal(opens, 1, "openInvitation runs synchronously in the tap");
  } finally {
    await view.cleanup();
  }
});

test("section headings carry a kawung rule drawn like a canting stroke", () => {
  const render = (options, props) => {
    const { CantingRule } = createLoader(options)("components/CantingRule");
    return new JSDOM(renderToStaticMarkup(React.createElement(CantingRule, props))).window.document;
  };
  for (const align of ["center", "left"]) {
    const doc = render({}, { align });
    const svg = doc.querySelector("svg[data-ni-canting]");
    assert.equal(svg.getAttribute("aria-hidden"), "true");
    assert.equal(svg.getAttribute("data-ni-canting"), "draw");
    assert.equal(svg.querySelectorAll("ellipse").length, 4, `${align}: kawung centre`);
    assert.equal(svg.querySelectorAll("path").length, align === "center" ? 2 : 1);
  }
  const still = render({ reducedMotion: true }, { align: "center" });
  assert.equal(still.querySelector("svg").getAttribute("data-ni-canting"), "static");

  const { SectionHeading } = createLoader()("components/SectionHeading");
  const heading = new JSDOM(renderToStaticMarkup(React.createElement(SectionHeading, { title: "Acara", align: "center" }))).window.document;
  assert.ok(heading.querySelector("svg[data-ni-canting]"), "SectionHeading renders the canting rule");
});

test("melati shower drops twelve blossoms and stays silent under reduced motion", () => {
  const { MelatiShower } = createLoader()("components/MelatiShower");
  const doc = new JSDOM(renderToStaticMarkup(React.createElement(MelatiShower))).window.document;
  const shower = doc.querySelector("[data-ni-melati]");
  assert.equal(shower.getAttribute("aria-hidden"), "true");
  assert.equal(shower.querySelectorAll("svg.ni-melati-petal").length, 12);

  const still = createLoader({ reducedMotion: true })("components/MelatiShower").MelatiShower;
  assert.equal(renderToStaticMarkup(React.createElement(still)), "");
});

test("copying an account number stamps a wax seal", async () => {
  const { GiftAccountCard } = createLoader()("sections/GiftAccountCard");
  const gift = { id: "gift", providerType: "bank", providerName: "BCA", accountNumber: "1234567890", accountName: "Alya", logoUrl: null, sortOrder: 0 };
  const view = await mount(React.createElement(GiftAccountCard, { gift }));
  try {
    Object.defineProperty(view.window.navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } });
    const seal = view.document.querySelector("[data-ni-seal]");
    assert.equal(seal.getAttribute("aria-hidden"), "true");
    assert.equal(seal.hasAttribute("data-stamped"), false);
    const button = [...view.document.querySelectorAll("button")].find((node) => /Salin/.test(node.textContent));
    await act(async () => button.click());
    assert.equal(seal.hasAttribute("data-stamped"), true);
    assert.equal(button.textContent, "Tersalin");
  } finally {
    await view.cleanup();
  }
});

test("ni-body copy is never set below 1rem", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) {
        const source = readFileSync(full, "utf8");
        for (const match of source.matchAll(/ni-body[^"`]*/g)) {
          if (/text-(sm|xs|\[0\.)/.test(match[0])) offenders.push(`${entry.name}: ${match[0]}`);
        }
      }
    }
  };
  walk(ivoryRoot);
  assert.deepEqual(offenders, []);
});

const ALL_FEATURES = { music: false, countdown: false, maps: false, story: true, gallery: true, dressCode: false,
  livestream: false, rsvp: true, wishes: true, gift: true, guestPersonalization: false };
const STORY = { id: "s", title: "Bertemu", storyDate: null, yearLabel: "2020", description: null, imageUrl: null, sortOrder: 0 };
const PHOTO = { id: "p", imageUrl: "https://img.test/p.jpg", caption: null, altText: "Foto", aspectRatio: "portrait_4_5", sortOrder: 0 };
const GIFT = { id: "gift", providerType: "bank", providerName: "BCA", accountNumber: "1", accountName: "Alya", logoUrl: null, sortOrder: 0 };

function navLabels(overrides) {
  const { NusantaraIvory } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(NusantaraIvory, { invitation: invitation(overrides), guest: null }));
  const { document } = new JSDOM(html).window;
  return [...document.querySelectorAll("nav .ni-floating-nav-label")].map((node) => node.textContent.trim());
}

test("the Ivory bar picks at most five items through the shared nav priority, in page order", () => {
  const source = readFileSync(resolve(ivoryRoot, "NusantaraIvory.tsx"), "utf8");
  assert.match(source, /import \{ pickNavItems \} from "@\/themes\/shared\/nav-priority"/);
  assert.doesNotMatch(source, /priority:\s*\d/, "no theme-local priority table");

  const full = navLabels({ features: ALL_FEATURES, stories: [STORY], gallery: [PHOTO], gifts: [GIFT] });
  assert.deepEqual(full, ["Beranda", "Acara", "RSVP", "Ucapan", "Kado"]);

  const browsing = navLabels({
    features: { ...ALL_FEATURES, rsvp: false, wishes: false, gift: false },
    stories: [STORY], gallery: [PHOTO],
  });
  assert.deepEqual(browsing, ["Beranda", "Mempelai", "Acara", "Cerita", "Galeri"]);
});

function cssRule(styles, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`(^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing rule ${selector}`);
  return match[2];
}

test("the Ivory bar meets the DESIGN.md 12a mobile sizing", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const navBlock = styles.slice(styles.indexOf(".ni-floating-nav {"), styles.indexOf(".ni-addcal-trigger"));
  assert.doesNotMatch(navBlock, /overflow-x:\s*(auto|scroll)/, "the rail never scrolls sideways");

  const bar = cssRule(styles, ".ni-floating-nav");
  assert.match(bar, /padding-inline:\s*max\(12px, env\(safe-area-inset-left\)\) max\(12px, env\(safe-area-inset-right\)\)/);
  assert.match(bar, /padding-bottom:\s*max\(12px, env\(safe-area-inset-bottom\)\)/);

  const rail = cssRule(styles, ".ni-floating-nav-rail");
  assert.match(rail, /width:\s*100%/);
  assert.match(rail, /overflow:\s*hidden/);
  assert.match(cssRule(styles, ".ni-floating-nav-rail > li"), /flex:\s*1 1 0/, "equal-width items");

  const button = cssRule(styles, ".ni-floating-nav-btn");
  const height = Number(button.match(/min-height:\s*(\d+)px/)?.[1]);
  assert.ok(height >= 52, `item min-height ${height}px`);

  assert.match(cssRule(styles, ".ni-floating-nav-glyph svg"), /width:\s*clamp\(18px, 5\.2vw, 22px\)/);
  const label = cssRule(styles, ".ni-floating-nav-label");
  assert.equal(label.match(/font-size:\s*([^;]+);/)[1].trim(), "clamp(11px, 3vw, 12px)");
  assert.match(label, /white-space:\s*nowrap/);
  assert.match(label, /text-overflow:\s*ellipsis/);
  for (const value of navBlock.matchAll(/\.ni-floating-nav-label \{[^}]*font-size:\s*([0-9.]+)(px|rem)/g)) {
    const px = value[2] === "rem" ? Number(value[1]) * 16 : Number(value[1]);
    assert.ok(px >= 11, `label font-size ${value[1]}${value[2]} is below 11px`);
  }

  const active = cssRule(styles, ".ni-floating-nav-btn[data-active]");
  const token = Object.fromEntries([...styles.matchAll(/--ni-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  const activeInk = active.match(/color:\s*var\(--ni-([a-z0-9-]+)\)/)[1];
  assert.ok(contrast(token[activeInk], token.cream) >= 4.5, "active label is AA on the active pill");

  assert.match(cssRule(styles, ".ni-content[data-ni-nav]"), /padding-bottom:\s*var\(--ni-nav-clearance\)/, "content clears the bar");
  assert.match(styles, /--ni-nav-clearance:\s*calc\(/);
});

test("the content wrapper reserves room for the bar only when the bar renders", () => {
  const { CoverGate } = createLoader()("CoverGate");
  const items = [
    { id: "ni-beranda", label: "Beranda", icon: "home", section: "hero" },
    { id: "ni-acara", label: "Acara", icon: "calendar", section: "events" },
  ];
  const render = (navItems) => new JSDOM(renderToStaticMarkup(React.createElement(CoverGate, {
    invitationId: "ivory", guestToken: null, eyebrow: null, displayName: "Alya & Bima",
    eventDate: "2030-10-20", guestDisplayName: null, musicUrl: null, musicEnabled: false, navItems,
  }, React.createElement("p", null, "isi")))).window.document;
  assert.ok(render(items).querySelector(".ni-content[data-ni-nav]"));
  assert.equal(render(items.slice(0, 1)).querySelector(".ni-content[data-ni-nav]"), null);
});
