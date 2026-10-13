# Template Audit Round C (Event Types) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every event type reads like its own invitation. A birthday, aqiqah, graduation, engagement or corporate page gets its own sentences, not wedding sentences with a swapped noun. The 25 round C matrix failures ("Mempelai" on non-wedding pages) go to zero.

**Architecture:** One shared copy deck, `src/themes/shared/event-copy.ts`, maps `InvitationType` to plain strings: event name, cover eyebrow, people eyebrow, heading and nav label, story heading, countdown heading, wishes prompt, gift intro and default closing line. A helper gives the parents line per type and role. Each theme root calls `eventCopy(invitation.type)` once and passes strings down as props, so client sections only receive strings. Identity accents stay per theme: Terra's Latin specimen, Midnight's "Dua insan" wedding eyebrow, Kelir's wayang figures and role labels (wedding only), and the neutral headings that already fit every type ("Menuju hari itu", "Menuju malam itu", "Menghitung Hari", RSVP, "Salam dari pesisir").

**Tech Stack:** Next.js 16, React 19, TypeScript strict, `node --test` with the `ts.transpileModule` + jsdom harness from `tests/template-hydration.test.mjs`, the QA matrix (`npm run qa:matrix`).

**Spec:** `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md` (Round C). Evidence: `docs/qa/2026-10-template-audit.md` baseline row "Wedding-only copy on non-wedding pages".

## Copy deck (owner-approved 2026-10-13)

| Slot | Pernikahan | Lamaran | Ulang tahun | Aqiqah | Wisuda | Korporat |
|---|---|---|---|---|---|---|
| eventName (Kelir "Pagelaran …", Midnight/Cobalt cover intro) | Pernikahan | Lamaran | Ulang Tahun | Tasyakuran Aqiqah | Wisuda | Perayaan |
| coverEyebrow | The Wedding Of | Lamaran | Merayakan Ulang Tahun | Tasyakuran Aqiqah | Merayakan Kelulusan | Undangan |
| peopleEyebrow * | Yang berbahagia | Dua hati | Yang dirayakan | Buah hati kami | Yang diwisuda | Tuan rumah |
| peopleHeading | Mempelai | Pasangan | Yang Berulang Tahun | Ananda | Wisudawan | Penyelenggara |
| peopleNavLabel (≤ 8 chars) | Mempelai | Pasangan | Profil | Ananda | Profil | Profil |
| parents line | Putri dari / Putra dari | Putri dari / Putra dari | Putra/putri dari | Buah hati dari | Putra/putri dari | hidden |
| storyHeading | Perjalanan Kami | Kisah Kami | Lembar Kenangan | Kisah Kelahiran | Jejak Perjuangan | Tentang Kami |
| countdownHeading | Menuju hari bahagia | Menuju hari lamaran | Menuju hari istimewa | Menuju syukuran | Menuju hari wisuda | Menuju acara |
| wishesPrompt | Titipkan doa untuk kedua mempelai. | Doakan langkah kami berikutnya. | Tuliskan ucapan dan harapan untuknya. | Kirimkan doa terbaik untuk Ananda. | Beri ucapan selamat dan semangat. | Tinggalkan pesan untuk kami. |
| giftIntro | Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, informasinya ada di bawah ini. | Doa Anda untuk langkah kami sudah lebih dari cukup. Bila berkenan memberi tanda kasih, informasinya ada di bawah ini. | Kehadiran Anda adalah kado terbaik. Bila ingin berbagi kebahagiaan, informasinya ada di bawah ini. | Doa untuk Ananda adalah hadiah paling berharga. Bila berkenan berbagi, informasinya ada di bawah ini. | Ucapan selamat Anda sudah sangat berarti. Bila ingin memberi hadiah, informasinya ada di bawah ini. | Bila Anda ingin memberi dukungan, informasinya ada di bawah ini. |
| closingLine (Kelir default when the admin leaves it empty) | Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. | … berkenan hadir dan mendoakan langkah kami. | … berkenan hadir dan merayakan bersama kami. | … berkenan hadir dan turut mendoakan Ananda. | … berkenan hadir dan merayakan pencapaian ini. | Kami menantikan kehadiran Bapak/Ibu/Saudara/i. |
| Terra specimen | Rosa amoris | Rosa promissa | Helianthus natalis | Lilium novum | Laurus nobilis | Quercus robur |

\* `peopleEyebrow` is new in this plan (Midnight, Cobalt and Kelir print a small line above the people heading; today it reads "Tuan rumah" for every non-wedding type). The owner confirms or edits the row when reviewing this plan.

Theme-only decisions:
- Midnight keeps "Dua insan" as its wedding people eyebrow; every other type uses the deck.
- Ivory's gift heading "Wedding Gift" stays for weddings; other types read "Kado Digital".
- Cobalt's story eyebrow becomes "Catatan perjalanan" and the rail's aria-label "Kronologi cerita" (both were couple-only).
- Terra's cover label stays "The Wedding Journal" for weddings; other types show `coverEyebrow`.
- Kelir's role labels ("Mempelai Wanita/Pria") and wayang figures stay wedding-only. The matrix flags "mempelai" on engagement pages too, so engagements get no role label.
- Wedding copy changes only where the deck changes it: the wishes prompt, gift intro and story heading become the deck sentences in every theme.

## Global Constraints

- Presentation only. No schema, data, package or admin change. The admin's opening and closing messages are customer data and are never rewritten.
- Themes never query Supabase and never import `@/lib/packages/` (readiness test).
- Section anchors (`-mempelai`, `-cerita`, …) keep their ids. Only visible copy changes.
- Nav labels are at most 8 characters, so the round B nav fits still hold at 320 px.
- Client components (`"use client"`) receive strings only, never functions.
- No new dependency.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Engagement pages use bride/groom roles.** They must get "Putri dari / Putra dari" and "Pasangan" but no "Mempelai" anywhere, including Kelir role labels. Task 2 pins this for every theme.
2. **Corporate pages with parent names filled in.** The parents block must disappear entirely, not print names under an empty label. Pinned in Task 1 (helper) and Task 2 (render test asserts "dari" is absent from the people section).
3. **Admin closing message empty on Kelir.** The fallback must follow the type. Pinned in Task 2 (the test blanks the admin messages).
4. **Long eyebrows on a 320 px cover** ("Merayakan Ulang Tahun", 21 chars, in Terra's Courier label and Kelir's hero). These are checked by the matrix screenshots in Task 7, Step 4.
5. **A theme passes the deck but a stray hard-coded string remains**, for example an aria-label. The render test reads text and every `aria-label`, so it catches what a screen reader announces.

---

## File Structure

- Create: `src/themes/shared/event-copy.ts` — the deck plus `parentLineFor`.
- Create: `tests/event-copy.test.mjs` — deck rules (unit).
- Create: `tests/template-event-copy.test.mjs` — every theme × every type, rendered and opened in jsdom.
- Modify, per theme: the root (`NusantaraIvory.tsx`, `TerraBotanica.tsx`, `MidnightAtelier.tsx`, `CobaltRiviera.tsx`, `KelirKencana.tsx`) and its `CoupleSection`, `StorySection`, `GiftSection`, plus where listed `WishesSection`, `CountdownSection`, `ClosingSection` and Terra's `CoverGate`.
- Modify tests that pin old non-wedding copy: `tests/midnight-atelier-identity.test.mjs:810`, `tests/cobalt-riviera-identity.test.mjs:726`.
- Docs: `docs/DESIGN.md` §28.2, `docs/qa/2026-10-template-audit.md` round C table.

---

### Task 1: Shared copy deck

**Files:**
- Create: `src/themes/shared/event-copy.ts`
- Test: `tests/event-copy.test.mjs`

**Interfaces:**
- Produces: `eventCopy(type: InvitationType): EventCopy`, `parentLineFor(type: InvitationType, role: PersonRole): string | null`, `interface EventCopy { eventName; coverEyebrow; peopleEyebrow; peopleHeading; peopleNavLabel; storyHeading; countdownHeading; wishesPrompt; giftIntro; closingLine }` (all `string`).

- [ ] **Step 1: Write the failing test**

`tests/event-copy.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

function loadTs(path) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, module: { exports } });
  return exports;
}

const { eventCopy, parentLineFor } = loadTs("themes/shared/event-copy.ts");
const TYPES = ["wedding", "engagement", "birthday", "aqiqah", "graduation", "corporate"];
const ROLES = ["bride", "groom", "celebrant", "host", "speaker"];
const SLOTS = ["eventName", "coverEyebrow", "peopleEyebrow", "peopleHeading", "storyHeading", "countdownHeading", "wishesPrompt", "giftIntro", "closingLine"];
const WEDDING_WORDS = /mempelai|pernikahan|wedding|pengantin|doa restu|hari bahagia/i;

test("every type fills every slot", () => {
  for (const type of TYPES) {
    const copy = eventCopy(type);
    for (const slot of [...SLOTS, "peopleNavLabel"]) assert.ok(copy[slot]?.trim(), `${type}.${slot}`);
  }
});

test("each type has its own sentence in every slot, not a shared template", () => {
  for (const slot of SLOTS) {
    const values = TYPES.map((type) => eventCopy(type)[slot]);
    assert.equal(new Set(values).size, TYPES.length, `${slot}: ${values.join(" | ")}`);
  }
});

test("non-wedding copy never borrows wedding words", () => {
  for (const type of TYPES.filter((t) => t !== "wedding")) {
    const copy = eventCopy(type);
    for (const slot of [...SLOTS, "peopleNavLabel"]) assert.doesNotMatch(copy[slot], WEDDING_WORDS, `${type}.${slot}`);
    for (const role of ROLES) {
      const line = parentLineFor(type, role);
      if (line) assert.doesNotMatch(line, WEDDING_WORDS, `${type}/${role}`);
    }
  }
});

test("wedding keeps its established words", () => {
  const copy = eventCopy("wedding");
  assert.equal(copy.coverEyebrow, "The Wedding Of");
  assert.equal(copy.peopleHeading, "Mempelai");
  assert.equal(copy.peopleNavLabel, "Mempelai");
  assert.equal(copy.eventName, "Pernikahan");
});

test("nav labels fit the 320 px bar (8 characters at most)", () => {
  for (const type of TYPES) assert.ok(eventCopy(type).peopleNavLabel.length <= 8, type);
});

test("parents line follows type and role; corporate hides it", () => {
  for (const type of ["wedding", "engagement"]) {
    assert.equal(parentLineFor(type, "bride"), "Putri dari");
    assert.equal(parentLineFor(type, "groom"), "Putra dari");
  }
  assert.equal(parentLineFor("birthday", "celebrant"), "Putra/putri dari");
  assert.equal(parentLineFor("graduation", "celebrant"), "Putra/putri dari");
  assert.equal(parentLineFor("aqiqah", "celebrant"), "Buah hati dari");
  for (const role of ROLES) assert.equal(parentLineFor("corporate", role), null, role);
});

test("an unknown type falls back to neutral copy instead of throwing", () => {
  assert.equal(eventCopy("reunion").peopleHeading, eventCopy("corporate").peopleHeading);
  assert.equal(parentLineFor("reunion", "host"), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/event-copy.test.mjs`
Expected: FAIL with ENOENT for `src/themes/shared/event-copy.ts`.

- [ ] **Step 3: Write the implementation**

`src/themes/shared/event-copy.ts`:

```ts
import type { InvitationType, PersonRole } from "@/types/invitation";

/**
 * Guest-facing copy that changes with the event type. Every type has its
 * own sentences; a birthday is never a wedding with the noun swapped.
 * Themes keep their identity accents (Terra's specimen, Midnight's
 * "Dua insan") and their neutral headings; admin messages are data and
 * never come from here.
 */
export interface EventCopy {
  /** Short event noun: "Pagelaran {eventName}", Midnight/Cobalt cover intro. */
  eventName: string;
  coverEyebrow: string;
  peopleEyebrow: string;
  peopleHeading: string;
  /** At most 8 characters so the 320 px nav keeps it whole. */
  peopleNavLabel: string;
  storyHeading: string;
  countdownHeading: string;
  wishesPrompt: string;
  giftIntro: string;
  /** Used only when the admin leaves the closing message empty. */
  closingLine: string;
}

const HONOUR = "Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan";
const GIFT_INFO = "informasinya ada di bawah ini.";

const EVENT_COPY: Record<InvitationType, EventCopy> = {
  wedding: {
    eventName: "Pernikahan",
    coverEyebrow: "The Wedding Of",
    peopleEyebrow: "Yang berbahagia",
    peopleHeading: "Mempelai",
    peopleNavLabel: "Mempelai",
    storyHeading: "Perjalanan Kami",
    countdownHeading: "Menuju hari bahagia",
    wishesPrompt: "Titipkan doa untuk kedua mempelai.",
    giftIntro: `Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, ${GIFT_INFO}`,
    closingLine: `${HONOUR} memberikan doa restu.`,
  },
  engagement: {
    eventName: "Lamaran",
    coverEyebrow: "Lamaran",
    peopleEyebrow: "Dua hati",
    peopleHeading: "Pasangan",
    peopleNavLabel: "Pasangan",
    storyHeading: "Kisah Kami",
    countdownHeading: "Menuju hari lamaran",
    wishesPrompt: "Doakan langkah kami berikutnya.",
    giftIntro: `Doa Anda untuk langkah kami sudah lebih dari cukup. Bila berkenan memberi tanda kasih, ${GIFT_INFO}`,
    closingLine: `${HONOUR} mendoakan langkah kami.`,
  },
  birthday: {
    eventName: "Ulang Tahun",
    coverEyebrow: "Merayakan Ulang Tahun",
    peopleEyebrow: "Yang dirayakan",
    peopleHeading: "Yang Berulang Tahun",
    peopleNavLabel: "Profil",
    storyHeading: "Lembar Kenangan",
    countdownHeading: "Menuju hari istimewa",
    wishesPrompt: "Tuliskan ucapan dan harapan untuknya.",
    giftIntro: `Kehadiran Anda adalah kado terbaik. Bila ingin berbagi kebahagiaan, ${GIFT_INFO}`,
    closingLine: `${HONOUR} merayakan bersama kami.`,
  },
  aqiqah: {
    eventName: "Tasyakuran Aqiqah",
    coverEyebrow: "Tasyakuran Aqiqah",
    peopleEyebrow: "Buah hati kami",
    peopleHeading: "Ananda",
    peopleNavLabel: "Ananda",
    storyHeading: "Kisah Kelahiran",
    countdownHeading: "Menuju syukuran",
    wishesPrompt: "Kirimkan doa terbaik untuk Ananda.",
    giftIntro: `Doa untuk Ananda adalah hadiah paling berharga. Bila berkenan berbagi, ${GIFT_INFO}`,
    closingLine: `${HONOUR} turut mendoakan Ananda.`,
  },
  graduation: {
    eventName: "Wisuda",
    coverEyebrow: "Merayakan Kelulusan",
    peopleEyebrow: "Yang diwisuda",
    peopleHeading: "Wisudawan",
    peopleNavLabel: "Profil",
    storyHeading: "Jejak Perjuangan",
    countdownHeading: "Menuju hari wisuda",
    wishesPrompt: "Beri ucapan selamat dan semangat.",
    giftIntro: `Ucapan selamat Anda sudah sangat berarti. Bila ingin memberi hadiah, ${GIFT_INFO}`,
    closingLine: `${HONOUR} merayakan pencapaian ini.`,
  },
  corporate: {
    eventName: "Perayaan",
    coverEyebrow: "Undangan",
    peopleEyebrow: "Tuan rumah",
    peopleHeading: "Penyelenggara",
    peopleNavLabel: "Profil",
    storyHeading: "Tentang Kami",
    countdownHeading: "Menuju acara",
    wishesPrompt: "Tinggalkan pesan untuk kami.",
    giftIntro: `Bila Anda ingin memberi dukungan, ${GIFT_INFO}`,
    closingLine: "Kami menantikan kehadiran Bapak/Ibu/Saudara/i.",
  },
};

/** Stored rows may carry a type added later; they read as a neutral event. */
export function eventCopy(type: InvitationType): EventCopy {
  return EVENT_COPY[type] ?? EVENT_COPY.corporate;
}

/** The label before the parents' names, or null when the type hides parents. */
export function parentLineFor(type: InvitationType, role: PersonRole): string | null {
  if (type === "wedding" || type === "engagement") {
    if (role === "bride") return "Putri dari";
    if (role === "groom") return "Putra dari";
    return "Putra/putri dari";
  }
  if (type === "birthday" || type === "graduation") return "Putra/putri dari";
  if (type === "aqiqah") return "Buah hati dari";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/event-copy.test.mjs`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/themes/shared/event-copy.ts tests/event-copy.test.mjs
git commit -m "feat(themes): shared event-type copy deck"
```

---

### Task 2: Cross-theme render test (red for all five)

**Files:**
- Create: `tests/template-event-copy.test.mjs`

**Interfaces:**
- Consumes: `eventCopy` (Task 1), `buildQaFixture` / `QA_DEFAULT_GUEST` (`src/lib/qa/fixture-invitation.ts`), `ThemeRenderer`, `themeRegistry`.
- Produces: test names `"<slug> <type> reads as its own event"`, filterable with `--test-name-pattern`.

- [ ] **Step 1: Write the test**

`tests/template-event-copy.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

import { JSDOM } from "jsdom";
import ts from "typescript";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../scripts/demo/content.mjs";

// Round C: each event type reads as its own invitation. Every theme is
// mounted in jsdom for every type, opened like a guest would, and its text
// plus every aria-label is checked. Admin messages are blanked: they are
// customer data, and Kelir's empty-closing fallback must follow the type.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const React = nodeRequire("react");

const STUBS = {
  "next/image": {
    __esModule: true,
    default: (props) => React.createElement("img", { src: props.src, alt: props.alt, className: props.className }),
  },
  "@/components/TurnstileWidget": { TurnstileWidget: () => null },
  "@/app/(public)/[slug]/actions": {
    trackCoverOpenedAction: async () => {},
    submitRsvpAction: async () => ({}),
    submitWishAction: async () => ({}),
  },
};

function resolveFile(file) {
  for (const candidate of [`${file}.tsx`, `${file}.ts`, file, `${file}/index.ts`, `${file}/index.tsx`]) {
    if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return candidate;
  }
  throw new Error(`Missing module ${file}`);
}

function createLoader() {
  const cache = new Map();
  function load(file) {
    const path = resolveFile(file);
    if (cache.has(path)) return cache.get(path).exports;
    const loaded = { exports: {} };
    cache.set(path, loaded);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInThisContext(`(function (exports, module, require) {${output}\n})`)(loaded.exports, loaded, (name) => {
      if (STUBS[name]) return STUBS[name];
      if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
      if (name.startsWith(".")) return load(resolve(dirname(path), name));
      return nodeRequire(name);
    });
    return loaded.exports;
  }
  return (relativePath) => load(resolve(srcRoot, relativePath));
}

const GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node", "Element", "IntersectionObserver", "ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "getComputedStyle"];

/** Mounts, presses "Buka Undangan", and returns the guest's text and aria-labels. */
async function openedCopy(element) {
  const dom = new JSDOM(`<div id="root"></div>`, { url: "https://invitation.test/", pretendToBeVisual: true });
  const { window } = dom;
  window.matchMedia = (query) => ({
    matches: /prefers-reduced-motion/.test(query), media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  });
  window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  const prior = Object.fromEntries(GLOBALS.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of GLOBALS) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "window" ? window : window[key] });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const originalError = console.error;
  console.error = () => {};
  try {
    const { createRoot } = nodeRequire("react-dom/client");
    const root = createRoot(window.document.getElementById("root"));
    await React.act(async () => root.render(element));
    const open = [...window.document.querySelectorAll("button")].find((button) => /buka undangan/i.test(button.textContent));
    assert.ok(open, "the cover has a Buka Undangan button");
    await React.act(async () => open.click());
    await React.act(async () => new Promise((done) => setTimeout(done, 50)));
    const document = window.document;
    for (const style of document.querySelectorAll("style")) style.remove();
    const text = document.body.textContent.replace(/\s+/g, " ");
    const labels = [...document.querySelectorAll("[aria-label]")].map((node) => node.getAttribute("aria-label"));
    const people = document.querySelector("[id$='-mempelai']")?.textContent.replace(/\s+/g, " ") ?? "";
    await React.act(async () => root.unmount());
    return { text, labels, people };
  } finally {
    console.error = originalError;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    for (const key of GLOBALS) {
      if (prior[key]) Object.defineProperty(globalThis, key, prior[key]);
      else delete globalThis[key];
    }
    window.close();
  }
}

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };
const TYPES = ["wedding", "engagement", "birthday", "aqiqah", "graduation", "corporate"];
// Words that belong to a wedding, including the theme accents that did.
const WEDDING_ONLY = /mempelai|pernikahan|wedding|doa restu|hari bahagia|dua insan|rosa amoris|cerita pasangan/i;

const loader = createLoader();
const { themeRegistry } = loader("themes/registry");
const { eventCopy } = loader("themes/shared/event-copy");

for (const slug of Object.keys(themeRegistry)) {
  for (const type of TYPES) {
    test(`${slug} ${type} reads as its own event`, async () => {
      const source = DEMOS.find((demo) => demo.theme === slug);
      assert.ok(source, `${slug} has demo content`);
      const copy = eventCopy(type);
      const view = createLoader();
      const { buildQaFixture, QA_DEFAULT_GUEST } = view("lib/qa/fixture-invitation");
      const { ThemeRenderer } = view("themes/ThemeRenderer");
      const { invitation, guest } = buildQaFixture(source, library, { packageKey: "grand", type, condition: "lengkap", guestName: QA_DEFAULT_GUEST });
      const blanked = { ...invitation, content: { ...invitation.content, openingQuote: null, openingMessage: null, closingMessage: null } };
      const { text, labels, people } = await openedCopy(React.createElement(ThemeRenderer, { invitation: blanked, guest }));

      for (const expected of [copy.peopleHeading, copy.peopleNavLabel, copy.storyHeading, copy.giftIntro]) {
        assert.ok(text.includes(expected), `missing "${expected}"`);
      }
      if (type === "wedding") return;
      const leak = text.match(WEDDING_ONLY) ?? labels.join(" | ").match(WEDDING_ONLY);
      assert.equal(leak, null, `wedding copy on a ${type} page: "${leak?.[0]}"`);
      if (type === "corporate") assert.doesNotMatch(people, /\bdari\b/, "corporate hides the parents line");
      if (type === "engagement") assert.match(people, /Putri dari|Putra dari/, "an engagement names each family");
    });
  }
}
```

- [ ] **Step 2: Run it to see the red baseline**

Run: `node --test tests/template-event-copy.test.mjs`
Expected: FAIL, 30 tests. Every theme fails at least its non-wedding cases (missing deck headings, "Mempelai" in the nav), and the wedding cases fail on the new story heading and gift intro. If a failure names a string that is not in this plan's per-theme tasks, note it; the owning theme task must fix it with the deck or a neutral word.

- [ ] **Step 3: Commit (red test, deliberately)**

```bash
git add tests/template-event-copy.test.mjs
git commit -m "test(themes): every theme reads as its own event type"
```

---

### Task 3: Nusantara Ivory

**Files:**
- Modify: `src/themes/nusantara-ivory/NusantaraIvory.tsx:36,41,88,107,132`
- Modify: `src/themes/nusantara-ivory/sections/CoupleSection.tsx:42,66-70,90-94`
- Modify: `src/themes/nusantara-ivory/sections/StorySection.tsx:8,13`
- Modify: `src/themes/nusantara-ivory/sections/GiftSection.tsx:8,15,21-22`

**Interfaces:**
- Consumes: `eventCopy`, `parentLineFor` from `@/themes/shared/event-copy`.
- Produces: `CoupleSection({ people, settings, invitationType, heading })`, `StorySection({ stories, heading })`, `GiftSection({ gifts, heading, intro })`.

- [ ] **Step 1: Run Ivory's cases to confirm red**

Run: `node --test --test-name-pattern="nusantara-ivory" tests/template-event-copy.test.mjs`
Expected: FAIL (6).

- [ ] **Step 2: Root**

In `NusantaraIvory.tsx`, add the import `import { eventCopy } from "@/themes/shared/event-copy";` and replace line 36:

```tsx
  const copy = eventCopy(invitation.type);
  const eyebrow = copy.coverEyebrow;
```

Nav candidate (line 41):

```tsx
    invitation.people.length > 0 ? { id: "ni-mempelai", label: copy.peopleNavLabel, icon: "heart", section: "couple" } : null,
```

Section calls:

```tsx
        <CoupleSection people={invitation.people} settings={invitation.theme.settings} invitationType={invitation.type} heading={copy.peopleHeading} />
```
```tsx
        {features.story ? <StorySection stories={invitation.stories} heading={copy.storyHeading} /> : null}
```
```tsx
        {features.gift ? (
          <GiftSection
            gifts={invitation.gifts}
            heading={invitation.type === "wedding" ? "Wedding Gift" : "Kado Digital"}
            intro={copy.giftIntro}
          />
        ) : null}
```

- [ ] **Step 3: Sections**

`CoupleSection.tsx`: import `parentLineFor` and `InvitationType` (`import type { InvitationPerson, InvitationType } from "@/types/invitation";`). Give `PersonDetails` an `invitationType: InvitationType` prop and replace line 42:

```tsx
  const childOf = parentLineFor(invitationType, person.role);
```

and the parents paragraph condition:

```tsx
      {parents && childOf ? (
```

`CoupleSection` signature and heading:

```tsx
export function CoupleSection({ people, settings, invitationType, heading }: {
  people: InvitationPerson[];
  settings?: Record<string, unknown>;
  invitationType: InvitationType;
  heading: string;
}) {
```
```tsx
        <SectionHeading title={heading} />
```

Pass `invitationType={invitationType}` to both `<PersonDetails …>` calls.

`StorySection.tsx`:

```tsx
export function StorySection({ stories, heading }: { stories: InvitationStory[]; heading: string }) {
```
```tsx
      <SectionHeading title={heading} align="left" />
```

`GiftSection.tsx`:

```tsx
export function GiftSection({ gifts, heading, intro }: { gifts: GiftAccount[]; heading: string; intro: string }) {
```
```tsx
          <SectionHeading eyebrow="Tanda Kasih" title={heading} align="left" tone="light" />
```

and replace the two-line paragraph text (lines 21–22) with `{intro}`.

- [ ] **Step 4: Fix direct mounts and run**

Run: `grep -n "CoupleSection\|StorySection\|GiftSection" tests/*.mjs | grep -i ivory`. Any test that mounts these Ivory sections directly gets the new props (`invitationType: "wedding", heading: "Mempelai"`, `heading: "Perjalanan Kami"`, `heading: "Wedding Gift", intro: "…"`).

Run: `node --test --test-name-pattern="nusantara-ivory" tests/template-event-copy.test.mjs && node --test tests/nusantara-ivory-identity.test.mjs tests/theme-shared-behavior.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/nusantara-ivory tests
git commit -m "feat(ivory): event-type copy from the shared deck"
```

---

### Task 4: Terra Botanica

**Files:**
- Modify: `src/themes/terra-botanica/TerraBotanica.tsx:31,55,66,74,78,79`
- Modify: `src/themes/terra-botanica/CoverGate.tsx` (props; line 62 specimen)
- Modify: `src/themes/terra-botanica/sections/CoupleSection.tsx:8-15,25-30`
- Modify: `src/themes/terra-botanica/sections/StorySection.tsx:7,11`
- Modify: `src/themes/terra-botanica/sections/WishesSection.tsx:17,31`
- Modify: `src/themes/terra-botanica/sections/GiftSection.tsx:7,14`

**Interfaces:**
- Consumes: `eventCopy`, `parentLineFor`.
- Produces: `CoverGate` prop `specimen: string`; `CoupleSection({ …, heading })`; `StorySection({ stories, heading })`; `WishesSection({ …, prompt })`; `GiftSection({ gifts, intro })`.

- [ ] **Step 1: Confirm red**

Run: `node --test --test-name-pattern="terra-botanica" tests/template-event-copy.test.mjs`
Expected: FAIL (6).

- [ ] **Step 2: Root**

In `TerraBotanica.tsx` import `eventCopy` and `InvitationType`, and add above the component:

```tsx
// Each type's cover carries its own Latin plant name, after the wedding's
// Rosa amoris: a promise rose, a birthday sunflower, a newborn lily, the
// graduate's laurel and the firm's oak.
const SPECIMENS: Record<InvitationType, string> = {
  wedding: "Rosa amoris",
  engagement: "Rosa promissa",
  birthday: "Helianthus natalis",
  aqiqah: "Lilium novum",
  graduation: "Laurus nobilis",
  corporate: "Quercus robur",
};
```

Inside the component: `const copy = eventCopy(invitation.type);`. Wherever the nav candidates are built (line 31, inside `buildTerraNavItems(invitation)` if that is where it lives), use `label: eventCopy(invitation.type).peopleNavLabel`. CoverGate props:

```tsx
        label={invitation.type === "wedding" ? "The Wedding Journal" : copy.coverEyebrow}
        specimen={SPECIMENS[invitation.type] ?? SPECIMENS.corporate}
```

Section calls:

```tsx
        <CoupleSection people={invitation.people} settings={invitation.theme.settings} invitationType={invitation.type} heading={copy.peopleHeading} />
```
```tsx
        {invitation.features.story ? <StorySection stories={invitation.stories} heading={copy.storyHeading} /> : null}
```

Add `prompt={copy.wishesPrompt}` to `<WishesSection …>` and change the gift call to `<GiftSection gifts={invitation.gifts} intro={copy.giftIntro} />`.

- [ ] **Step 3: CoverGate and sections**

`CoverGate.tsx`: add `specimen` to the destructured props and `specimen: string;` to the props type, then:

```tsx
              <p className="tb-specimen tb-label" aria-hidden="true">{specimen} · No. 01</p>
```

`CoupleSection.tsx`:

```tsx
export function CoupleSection({ people, settings, invitationType, heading }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
  heading: string;
}) {
```
```tsx
      <SectionHeading id="tb-couple-heading" title={heading} />
```

In the map, `const parentLine = parentLineFor(invitationType, person.role);`, the block condition becomes `parents.length > 0 && parentLine ? (`, and the label `<p>{parentLine}</p>`.

`StorySection.tsx`: `({ stories, heading }: { stories: InvitationStory[]; heading: string })` and `title={heading}`.

`WishesSection.tsx`: add `prompt` to the destructured props and `prompt: string;` to the type; line 31 becomes `<p>{prompt}</p>`.

`GiftSection.tsx`: `({ gifts, intro }: { gifts: GiftAccount[]; intro: string })`; line 14 becomes `<p>{intro}</p>`.

- [ ] **Step 4: Fix direct mounts and run**

Direct mounts of these sections or `CoverGate` in `tests/terra-botanica-*.test.mjs` get the new props (`specimen: "Rosa amoris"`, `heading`, `prompt`, `intro`). `tests/terra-botanica-identity.test.mjs:202` still expects "Rosa amoris" on the wedding cover.

Run: `node --test --test-name-pattern="terra-botanica" tests/template-event-copy.test.mjs && node --test tests/terra-botanica-*.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/terra-botanica tests
git commit -m "feat(terra): event-type copy and a specimen per type"
```

---

### Task 5: Midnight Atelier

**Files:**
- Modify: `src/themes/midnight-atelier/MidnightAtelier.tsx:29,66,84,97,111-118,119`
- Modify: `src/themes/midnight-atelier/sections/CoupleSection.tsx:8-12,14-26,57`
- Modify: `src/themes/midnight-atelier/sections/StorySection.tsx:18,25`
- Modify: `src/themes/midnight-atelier/sections/WishesSection.tsx:20,43`
- Modify: `src/themes/midnight-atelier/sections/GiftSection.tsx:7,15`
- Modify: `tests/midnight-atelier-identity.test.mjs:810`

**Interfaces:**
- Consumes: `eventCopy`, `parentLineFor`.
- Produces: `CoupleSection({ people, settings, invitationType, eyebrow, heading })`, `StorySection({ stories, heading })`, `WishesSection({ …, prompt })`, `GiftSection({ gifts, intro })`.

- [ ] **Step 1: Confirm red**

Run: `node --test --test-name-pattern="midnight-atelier" tests/template-event-copy.test.mjs`
Expected: FAIL (6).

- [ ] **Step 2: Root**

Import `eventCopy`; inside the component `const copy = eventCopy(invitation.type);`. In the nav builder (line 29) use `label: eventCopy(invitation.type).peopleNavLabel`. Cover intro (line 66):

```tsx
        intro={copy.eventName}
```

(the `label` line stays: "Midnight Atelier" / "Undangan malam"). Couple call:

```tsx
          <CoupleSection
            people={invitation.people}
            settings={invitation.theme.settings}
            invitationType={invitation.type}
            eyebrow={invitation.type === "wedding" ? "Dua insan" : copy.peopleEyebrow}
            heading={copy.peopleHeading}
          />
```

Story: `<StorySection stories={invitation.stories} heading={copy.storyHeading} />`; wishes: add `prompt={copy.wishesPrompt}`; gift: `<GiftSection gifts={invitation.gifts} intro={copy.giftIntro} />`.

- [ ] **Step 3: Sections**

`CoupleSection.tsx`: delete `parentLabel`, import `parentLineFor`, and:

```tsx
export function CoupleSection({ people, settings, invitationType, eyebrow, heading }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
  eyebrow: string;
  heading: string;
}) {
```
```tsx
        <p>{eyebrow}</p>
        <h2 id="ma-couple-heading">{heading}</h2>
```

In the map, `const parentLine = parentLineFor(invitationType, person.role);`, condition `parents.length > 0 && parentLine ? (`, label `<p>{parentLine}</p>`.

`StorySection.tsx`: add `heading: string`; line 25 `<h2 id="ma-story-heading">{heading}</h2>`. The "NN babak perjalanan" eyebrow stays.

`WishesSection.tsx`: add `prompt: string`; line 43 `<span>{prompt}</span>`.

`GiftSection.tsx`: add `intro: string`; line 15 `<span>{intro}</span>`.

- [ ] **Step 4: Update the pinned birthday copy, fix direct mounts, run**

`tests/midnight-atelier-identity.test.mjs:810`: the birthday cover intro is now "Ulang Tahun" and the people eyebrow "Yang dirayakan":

```js
  assertIndonesian(guestCopy(document), ["Undangan malam", "Ulang Tahun", "Yang dirayakan", "Tandai kalender Anda", "Simpan tanggalnya"]);
```

Any direct mount of the changed sections in `tests/midnight-atelier-*.test.mjs` gets the new props.

Run: `node --test --test-name-pattern="midnight-atelier" tests/template-event-copy.test.mjs && node --test tests/midnight-atelier-*.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/midnight-atelier tests
git commit -m "feat(midnight): event-type copy from the shared deck"
```

---

### Task 6: Cobalt Riviera

**Files:**
- Modify: `src/themes/cobalt-riviera/CobaltRiviera.tsx:34,74,95,102-106,108,122-129,130`
- Modify: `src/themes/cobalt-riviera/sections/CoupleSection.tsx:8-12,14-26,62`
- Modify: `src/themes/cobalt-riviera/sections/StorySection.tsx:18,24,25,31`
- Modify: `src/themes/cobalt-riviera/sections/CountdownSection.tsx:43-51,64`
- Modify: `src/themes/cobalt-riviera/sections/WishesSection.tsx:20,43`
- Modify: `src/themes/cobalt-riviera/sections/GiftSection.tsx:6,14`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx:74` (comment only, if it quotes old copy)
- Modify: `tests/cobalt-riviera-identity.test.mjs:726`

**Interfaces:**
- Consumes: `eventCopy`, `parentLineFor`.
- Produces: `CoupleSection({ people, settings, invitationType, eyebrow, heading })`, `StorySection({ stories, heading })`, `CountdownSection({ target, calendarEvent, calendarUid, heading })`, `WishesSection({ …, prompt })`, `GiftSection({ gifts, intro })`.

- [ ] **Step 1: Confirm red**

Run: `node --test --test-name-pattern="cobalt-riviera" tests/template-event-copy.test.mjs`
Expected: FAIL (6).

- [ ] **Step 2: Root**

Import `eventCopy`; `const copy = eventCopy(invitation.type);`. Nav builder (line 34): `label: eventCopy(invitation.type).peopleNavLabel`. Cover intro (line 74): `intro={copy.eventName}` (the label line stays). Then:

```tsx
          <CoupleSection
            people={invitation.people}
            settings={invitation.theme.settings}
            invitationType={invitation.type}
            eyebrow={copy.peopleEyebrow}
            heading={copy.peopleHeading}
          />
```
```tsx
          <CountdownSection
            target={countdownTarget}
            calendarEvent={calendarEvent}
            calendarUid={`${invitation.id}-${primaryEvent?.id ?? "main"}@invitation.digital`}
            heading={copy.countdownHeading}
          />
```

Story `heading={copy.storyHeading}`, wishes `prompt={copy.wishesPrompt}`, gift `intro={copy.giftIntro}`.

- [ ] **Step 3: Sections**

`CoupleSection.tsx`: delete `parentLabel`, import `parentLineFor`, same signature as Midnight's (`eyebrow`, `heading`), header:

```tsx
        <p>{eyebrow}</p>
        <h2 id="cr-couple-heading">{heading}</h2>
```

parents: `const parentLine = parentLineFor(invitationType, person.role);`, condition `parents.length > 0 && parentLine ? (`, `<p>{parentLine}</p>`.

`StorySection.tsx`:

```tsx
export function StorySection({ stories, heading }: { stories: InvitationStory[]; heading: string }) {
```
```tsx
        <p>Catatan perjalanan</p>
        <h2 id="cr-story-heading">{heading}</h2>
```
```tsx
        aria-label="Kronologi cerita"
```

`CountdownSection.tsx`: add `heading` to the destructured props and `heading: string;` to the type; line 64:

```tsx
        <h2 id="cr-countdown-heading">{hasTarget ? heading : "Simpan tanggalnya"}</h2>
```

`WishesSection.tsx`: add `prompt: string`; line 43 `<span>{prompt}</span>`.
`GiftSection.tsx`: add `intro: string`; line 14 `<span>{intro}</span>`.
`ThemeStyles.tsx:74`: if the comment quotes "Undangan perayaan" as the non-wedding label, it is still correct (the label did not change); leave it.

- [ ] **Step 4: Update the pinned birthday copy, fix direct mounts, run**

`tests/cobalt-riviera-identity.test.mjs:726`:

```js
  assertIndonesian(guestCopy(birthday), ["Undangan perayaan", "Ulang Tahun", "Yang dirayakan", "Tandai kalender Anda", "Simpan tanggalnya"]);
```

Direct mounts in `tests/cobalt-riviera-*.test.mjs` of the changed sections get the new props. `tests/cobalt-riviera-narrative.test.mjs:147` still expects "Putri dari" (its fixture is a wedding).

Run: `node --test --test-name-pattern="cobalt-riviera" tests/template-event-copy.test.mjs && node --test tests/cobalt-riviera-*.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/cobalt-riviera tests
git commit -m "feat(cobalt): event-type copy from the shared deck"
```

---

### Task 7: Kelir Kencana

**Files:**
- Modify: `src/themes/kelir-kencana/KelirKencana.tsx:27-34,42,71,83,93,101-106,112-116,118,132-139,140,141-146`
- Modify: `src/themes/kelir-kencana/sections/CoupleSection.tsx:10-14,30-45,79-81`
- Modify: `src/themes/kelir-kencana/sections/StorySection.tsx:19,24`
- Modify: `src/themes/kelir-kencana/sections/CountdownSection.tsx:43-51,64`
- Modify: `src/themes/kelir-kencana/sections/WishesSection.tsx:18,34`
- Modify: `src/themes/kelir-kencana/sections/GiftSection.tsx:7,16`
- Modify: `src/themes/kelir-kencana/sections/ClosingSection.tsx:8-12,38`

**Interfaces:**
- Consumes: `eventCopy`, `parentLineFor`.
- Produces: `CoupleSection({ people, settings, invitationType, eyebrow, heading })`, `StorySection({ stories, heading })`, `CountdownSection({ …, heading })`, `WishesSection({ …, prompt })`, `GiftSection({ gifts, intro })`, `ClosingSection({ displayName, message, fallbackMessage, imageUrl, imageAlt })`.

- [ ] **Step 1: Confirm red**

Run: `node --test --test-name-pattern="kelir-kencana" tests/template-event-copy.test.mjs`
Expected: FAIL (6).

- [ ] **Step 2: Root**

Delete `EVENT_NAMES` (lines 27–34) and the `InvitationType` import if unused; import `eventCopy`. Nav builder (line 42): `label: eventCopy(invitation.type).peopleNavLabel`. Replace line 71:

```tsx
  const copy = eventCopy(invitation.type);
```

Cover: `intro={`Pagelaran ${copy.eventName}`}` (aqiqah still reads "Pagelaran Tasyakuran Aqiqah", `tests/kelir-kencana.test.mjs:123`). Hero: `eyebrow={copy.coverEyebrow}`. Then:

```tsx
          <CoupleSection
            people={invitation.people}
            settings={invitation.theme.settings}
            invitationType={invitation.type}
            eyebrow={copy.peopleEyebrow}
            heading={copy.peopleHeading}
          />
```

Countdown `heading={copy.countdownHeading}`, story `heading={copy.storyHeading}`, wishes `prompt={copy.wishesPrompt}`, gift `intro={copy.giftIntro}`, closing:

```tsx
          <ClosingSection
            displayName={coupleDisplayName}
            message={invitation.content.closingMessage}
            fallbackMessage={copy.closingLine}
            imageUrl={closingImageUrl}
            imageAlt={closingImageAlt}
          />
```

- [ ] **Step 3: Sections**

`CoupleSection.tsx`: delete `parentLabel`, import `parentLineFor`, keep `roleLabel` and `figureFor` (wedding only, as today). Signature gains `eyebrow: string; heading: string;`:

```tsx
      <ChapterHeading
        id="kk-couple-heading"
        act="Jejer"
        eyebrow={eyebrow}
        title={heading}
      />
```

parents: `const parentLine = parentLineFor(invitationType, person.role);`, condition `parents.length > 0 && parentLine ? (`, `<p>{parentLine}</p>`.

`StorySection.tsx`: `heading: string`; `<ChapterHeading id="kk-story-heading" eyebrow="Lakon kami" title={heading} />`.

`CountdownSection.tsx`: add `heading: string`; line 64 `{hasTarget ? heading : "Simpan tanggalnya"}`.

`WishesSection.tsx`: add `prompt: string`; `lede={prompt}`.

`GiftSection.tsx`: add `intro: string`; `lede={intro}`.

`ClosingSection.tsx`: add `fallbackMessage: string` to props; line 38:

```tsx
        : <p className="kk-closing-message">{fallbackMessage}</p>}
```

- [ ] **Step 4: Fix direct mounts and run**

Direct mounts in `tests/kelir-kencana*.test.mjs` get the new props. `tests/kelir-kencana.test.mjs:133,136` still expect "Mempelai Wanita/Pria" on the wedding fixture; `:143` still expects no "Mempelai" on the birthday.

Run: `node --test --test-name-pattern="kelir-kencana" tests/template-event-copy.test.mjs && node --test tests/kelir-kencana*.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/kelir-kencana tests
git commit -m "feat(kelir): event-type copy from the shared deck"
```

---

### Task 8: Verify, document, PR

**Files:**
- Modify: `docs/DESIGN.md` §28.2 (the "Copy follows `invitation.type`" bullet)
- Modify: `docs/qa/2026-10-template-audit.md` (baseline note + round C table)

- [ ] **Step 1: Full checks**

Run each and expect success:

```bash
npm test
```
```bash
npm run lint
```
```bash
npm run typecheck
```
```bash
npm run build
```

- [ ] **Step 2: DESIGN.md §28.2**

Replace the bullet "Copy follows `invitation.type`: wedding eyebrows (…) only for weddings; other event types read naturally." with:

```markdown
- Copy follows `invitation.type` through `src/themes/shared/event-copy.ts`
  (`eventCopy`, `parentLineFor`): cover eyebrow, people heading and nav label,
  parents line, story, countdown, wishes prompt, gift intro and the default
  closing. A new theme takes these strings from the deck instead of writing
  its own; theme accents (Terra's specimen, Midnight's "Dua insan") stay in
  the theme. `tests/template-event-copy.test.mjs` renders every theme for
  every type.
```

- [ ] **Step 3: Core matrix**

Start the dev server (preview tool, the project's launch config), then run all five themes, one at a time:

```bash
npm run qa:matrix -- --theme nusantara-ivory --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

and the same for `terra-botanica`, `midnight-atelier`, `cobalt-riviera`, `kelir-kencana` (`PLAYWRIGHT_CORE` set as in round B). Expected: 21 pages each, 0 with failures (105 total).

- [ ] **Step 4: Look at the long eyebrows on phones**

Open the birthday screenshots at 320 and 375 for Terra (cover label "Merayakan Ulang Tahun") and Kelir (hero eyebrow) from the run's `qa-output/` folder. They must wrap or fit without overflow and without pushing "Buka Undangan" off the first screen (the matrix already checks the button). If one overflows, shorten nothing in the deck; add a theme CSS rule (`overflow-wrap: anywhere` / letter-spacing at ≤360 px) and rerun that theme.

- [ ] **Step 5: Audit report**

In `docs/qa/2026-10-template-audit.md`, after the round B note under the baseline table add:

```markdown
Fixed in round C (2026-10-13): the wedding-only copy row. Core matrix after
round C: 105 pages, 0 with failures.
```

and fill the round C table:

```markdown
| # | Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|---|
| C1 | All five | nav, people heading | "Mempelai" on every non-wedding page (25 matrix cases) | Important | matrix "wedding-only copy" | Fixed: deck `peopleHeading` / `peopleNavLabel` |
| C2 | All five | story, gift, wishes, countdown, Kelir closing | Wedding sentences for every type ("Doa restu…", "hari bahagia", "Cerita kami") | Important | `tests/template-event-copy.test.mjs` | Fixed: shared deck `src/themes/shared/event-copy.ts`, own sentences per type |
| C3 | All five | people parents line | "Putra/i dari", "Keluarga", "Orang tua" for non-couple roles; parents shown on corporate pages | Minor | same | Fixed: `parentLineFor` per type; hidden for corporate |
| C4 | Terra, Midnight, Cobalt, Kelir | cover | "Rosa amoris", "Perayaan" / "Undangan" for every non-wedding type | Minor | same | Fixed: a specimen per type (Terra); `eventName` / `coverEyebrow` |
| C5 | Cobalt | story rail | aria-label "Kronologi cerita pasangan" announced on every type | Minor | same (aria-labels) | Fixed: "Kronologi cerita" |
```

Change the "Not yet covered" paragraph's last clause from "and copy beyond the wedding-only words (round C)" to "and copy beyond the wedding-only words (covered by `tests/template-event-copy.test.mjs` since round C)".

- [ ] **Step 6: Commit**

```bash
git add docs/DESIGN.md docs/qa/2026-10-template-audit.md
git commit -m "docs(qa): round C findings fixed"
```

- [ ] **Step 7: Final review, then ask the owner**

Dispatch one fresh reviewer (most capable model) on `git diff main...HEAD` against this plan and the spec; fix confirmed findings test-first. Then present the finishing-branch options. Push and open the PR only on the owner's word, and merge only on the owner's explicit approval (merges to `main` deploy production).
