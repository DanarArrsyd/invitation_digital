import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
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
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

function loadTheme({ submitRsvp, submitWish } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    assert.ok(path, `Missing source module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob, process,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get FormData() { return globalThis.FormData; },
      get navigator() { return globalThis.window?.navigator; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      require(name) {
        if (name === "next/image") return { __esModule: true, default: (imageProps) => {
          const props = { ...imageProps };
          delete props.fill;
          delete props.fetchPriority;
          delete props.unoptimized;
          return React.createElement("img", props);
        } };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "motion/react") return { useReducedMotion: () => false };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: async () => {},
          submitRsvpAction: submitRsvp ?? (async () => ({ status: "success" })),
          submitWishAction: submitWish ?? (async () => ({ status: "success" })),
        };
        if (name.startsWith("@/")) return load(resolve(sourceRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return { load: (entry) => load(resolve(sourceRoot, entry)) };
}

const features = {
  music: false, countdown: false, maps: false, story: false, gallery: false,
  dressCode: false, livestream: false, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function fixture(overrides = {}) {
  return {
    id: "cobalt-interactions", type: "wedding", slug: "cobalt-interactions", title: "Mira & Bima", status: "published",
    eventDate: null, venueSummary: null, publishedAt: "2026-10-01T00:00:00Z", expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: {} }, people: [], events: [], stories: [], gallery: [],
    gifts: [{
      id: "gift-1", providerType: "bank", providerName: "Bank Riviera Internasional Dengan Nama Sangat Panjang",
      accountNumber: "1234 5678 9012 3456 7890", accountName: "Mira Savitri dan Bima Prakoso Dengan Nama Panjang",
      logoUrl: null, sortOrder: 0,
    }],
    wishes: [], content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: null }, ...overrides,
  };
}

const guest = { id: "guest", displayName: "Nama Tamu Undangan Yang Sangat Panjang", token: "guest-token", notes: null };

function render(invitation = fixture(), recipient = guest) {
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  return new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: recipient }))).window.document;
}

async function mount(options = {}, invitation = fixture(), recipient = guest) {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "FormData", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, FormData: dom.window.FormData,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { CobaltRiviera } = loadTheme(options).load("themes/cobalt-riviera");
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(CobaltRiviera, { invitation, guest: recipient })));
  return {
    document: dom.window.document,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, previous);
      dom.window.close();
    },
  };
}

async function enterText(element, value) {
  const prototype = element.tagName === "TEXTAREA"
    ? element.ownerDocument.defaultView.HTMLTextAreaElement.prototype
    : element.ownerDocument.defaultView.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
  await act(async () => element.dispatchEvent(new element.ownerDocument.defaultView.Event("input", { bubbles: true })));
}

function submit(form) {
  return act(async () => form.dispatchEvent(new form.ownerDocument.defaultView.Event("submit", { bubbles: true, cancelable: true })));
}

test("interaction chapters mount shared contracts and omit disabled or empty destinations", () => {
  const document = render();
  for (const id of ["cr-rsvp", "cr-ucapan", "cr-kado"]) {
    const section = document.getElementById(id);
    assert.ok(section, `${id} renders`);
    assert.ok(document.getElementById(section.getAttribute("aria-labelledby")), `${id} has a heading`);
  }
  for (const id of ["cr-rsvp", "cr-ucapan"]) {
    const form = document.querySelector(`#${id} form`);
    assert.deepEqual(
      ["invitationId", "slug", "guestToken"].map((name) => form.elements.namedItem(name).value),
      ["cobalt-interactions", "cobalt-interactions", "guest-token"],
    );
    assert.equal(form.elements.namedItem("guestName"), null);
    assert.match(form.textContent, /Nama Tamu Undangan Yang Sangat Panjang/);
  }
  assert.ok(document.querySelector('#cr-ucapan textarea[name="message"][maxlength="500"]'));
  assert.match(document.getElementById("cr-kado").textContent, /Bank Riviera Internasional Dengan Nama Sangat Panjang/);
  assert.match(document.getElementById("cr-kado").textContent, /1234 5678 9012 3456 7890/);
  assert.match(document.getElementById("cr-kado").textContent, /Mira Savitri dan Bima Prakoso Dengan Nama Panjang/);

  const noGift = render(fixture({ gifts: [] }));
  assert.equal(noGift.getElementById("cr-kado"), null);
  assert.equal(noGift.querySelector('a[href="#cr-kado"]'), null);
  const disabled = render(fixture({ features: { ...features, rsvp: false, wishes: false, gift: false } }));
  for (const id of ["cr-rsvp", "cr-ucapan", "cr-kado"]) assert.equal(disabled.getElementById(id), null);
});

test("guest personalization toggle keeps RSVP and wishes editable when disabled", () => {
  const document = render(fixture({ features: { ...features, guestPersonalization: false } }), guest);
  for (const id of ["cr-rsvp", "cr-ucapan"]) {
    const section = document.getElementById(id);
    assert.ok(section?.querySelector('input[name="guestName"]'));
    assert.equal(section?.querySelector(".cr-form-recipient"), null);
  }
});

test("RSVP submits exact fields and presents checked, pending, error, and success states", async () => {
  let resolveAction;
  const calls = [];
  const view = await mount({ submitRsvp: async (previous, data) => {
    calls.push(Object.fromEntries(data.entries()));
    return new Promise((resolvePromise) => { resolveAction = resolvePromise; });
  } });
  try {
    const form = view.document.querySelector("#cr-rsvp form");
    const attending = [...form.querySelectorAll('button[type="button"]')].find((button) => button.textContent.includes("Hadir"));
    await act(async () => attending.click());
    assert.equal(attending.getAttribute("aria-pressed"), "true");
    assert.ok(attending.querySelector(".cr-attendance-check"), "selection has an explicit check indicator");
    await submit(form);
    assert.deepEqual(calls[0], { invitationId: "cobalt-interactions", slug: "cobalt-interactions", guestToken: "guest-token", attendance: "attending" });
    assert.match(form.textContent, /Mengirim/);
    assert.equal(form.querySelector('button[type="submit"]').disabled, true);
    await act(async () => resolveAction({ status: "error", message: "Konfirmasi belum terkirim." }));
    assert.equal(form.querySelector("[role='alert']").textContent, "Konfirmasi belum terkirim.");
    assert.equal(form.elements.namedItem("attendance").value, "attending");
    await submit(form);
    await act(async () => resolveAction({ status: "success" }));
    assert.match(view.document.getElementById("cr-rsvp").textContent, /Konfirmasi kehadiran Anda telah kami terima/);
  } finally { await view.cleanup(); }
});

test("unpersonalized forms preserve newest edits through pending and error transitions", async () => {
  const resolvers = {};
  const view = await mount({
    submitRsvp: async () => new Promise((resolvePromise) => { resolvers.rsvp = resolvePromise; }),
    submitWish: async () => new Promise((resolvePromise) => { resolvers.wish = resolvePromise; }),
  }, fixture(), null);
  try {
    const rsvp = view.document.querySelector("#cr-rsvp form");
    assert.match(rsvp.querySelector('label[for="cr-rsvp-name"]').textContent, /Nama Anda/);
    await enterText(rsvp.elements.namedItem("guestName"), "Nama sebelum submit");
    await act(async () => [...rsvp.querySelectorAll('button[type="button"]')].find((button) => button.textContent.includes("Tidak Hadir")).click());
    await submit(rsvp);
    await enterText(rsvp.elements.namedItem("guestName"), "Nama terbaru saat pending");
    await act(async () => resolvers.rsvp({ status: "error", message: "Coba lagi." }));
    assert.equal(rsvp.elements.namedItem("guestName").value, "Nama terbaru saat pending");
    assert.equal(rsvp.elements.namedItem("attendance").value, "not_attending");

    const wish = view.document.querySelector("#cr-ucapan form");
    assert.match(wish.querySelector('label[for="cr-wish-name"]').textContent, /Nama Anda/);
    assert.match(wish.querySelector('label[for="cr-wish-message"]').textContent, /Ucapan/);
    await enterText(wish.elements.namedItem("guestName"), "Nama awal");
    await enterText(wish.elements.namedItem("message"), "Pesan awal");
    await submit(wish);
    await enterText(wish.elements.namedItem("guestName"), "Nama terbaru");
    await enterText(wish.elements.namedItem("message"), "Pesan terbaru saat pending");
    await act(async () => resolvers.wish({ status: "error", message: "Pesan belum terkirim." }));
    assert.equal(wish.elements.namedItem("guestName").value, "Nama terbaru");
    assert.equal(wish.elements.namedItem("message").value, "Pesan terbaru saat pending");
  } finally { await view.cleanup(); }
});

test("wish payload includes Turnstile proof and guest notes paginate without duplicates", async () => {
  const previousKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
  let resolveAction;
  const calls = [];
  const wishes = Array.from({ length: 6 }, (_, index) => ({
    id: `wish-${index}`, guestName: `Tamu ${index}`, message: `Doa panjang ${index}`,
    createdAt: "2026-10-01T00:00:00Z", isVisible: true, guestId: null,
  }));
  let view;
  try {
    view = await mount({ submitWish: async (previous, data) => {
      calls.push(Object.fromEntries(data.entries()));
      return new Promise((resolvePromise) => { resolveAction = resolvePromise; });
    } }, fixture({ wishes }));
    const section = view.document.getElementById("cr-ucapan");
    const form = section.querySelector("form");
    assert.equal(form.querySelector(".cf-turnstile").getAttribute("data-sitekey"), "test-site-key");
    const turnstile = view.document.createElement("input");
    turnstile.name = "cf-turnstile-response";
    turnstile.value = "turnstile-proof";
    form.append(turnstile);
    await enterText(form.elements.namedItem("message"), "Semoga berbahagia selalu.");
    await submit(form);
    assert.deepEqual(calls[0], {
      invitationId: "cobalt-interactions", slug: "cobalt-interactions", guestToken: "guest-token",
      message: "Semoga berbahagia selalu.", "cf-turnstile-response": "turnstile-proof",
    });
    await act(async () => resolveAction({ status: "error", message: "Pesan belum terkirim." }));
    assert.equal(form.querySelector("[role='alert']").textContent, "Pesan belum terkirim.");
    assert.deepEqual([...section.querySelectorAll("[data-wish-id]")].map((row) => row.dataset.wishId), wishes.slice(0, 5).map((wish) => wish.id));
    await act(async () => [...section.querySelectorAll("button")].find((button) => button.textContent.includes("Muat Lebih Banyak")).click());
    assert.deepEqual([...section.querySelectorAll("[data-wish-id]")].map((row) => row.dataset.wishId), wishes.map((wish) => wish.id));
  } finally {
    if (view) await view.cleanup();
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = previousKey;
  }
});

test("empty wishes invite the first entry and successful submission is acknowledged", async () => {
  assert.match(render().getElementById("cr-ucapan").textContent, /Jadilah yang pertama/);
  let resolveAction;
  const view = await mount({ submitWish: async () => new Promise((resolvePromise) => { resolveAction = resolvePromise; }) });
  try {
    await enterText(view.document.querySelector('#cr-ucapan [name="message"]'), "Doa hangat dari kejauhan.");
    await submit(view.document.querySelector("#cr-ucapan form"));
    await act(async () => resolveAction({ status: "success" }));
    assert.match(view.document.getElementById("cr-ucapan").textContent, /Terima kasih atas ucapan dan doanya/);
  } finally { await view.cleanup(); }
});

test("gift copy reports success only after clipboard acceptance", async () => {
  const view = await mount();
  const browserNavigator = view.document.defaultView.navigator;
  const descriptor = Object.getOwnPropertyDescriptor(browserNavigator, "clipboard");
  try {
    const button = view.document.querySelector("#cr-kado button");
    Object.defineProperty(browserNavigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
    await act(async () => button.click());
    assert.doesNotMatch(button.textContent, /Tersalin/);
    const copied = [];
    Object.defineProperty(browserNavigator, "clipboard", { configurable: true, value: { writeText: async (value) => { copied.push(value); } } });
    await act(async () => button.click());
    assert.deepEqual(copied, ["1234 5678 9012 3456 7890"]);
    assert.match(button.textContent, /Tersalin/);
  } finally {
    await view.cleanup();
    if (descriptor) Object.defineProperty(browserNavigator, "clipboard", descriptor);
    else delete browserNavigator.clipboard;
  }
});

test("interaction CSS keeps controls touch-safe, focus visible, and long content 320-safe", () => {
  const css = render().querySelector("style").textContent;
  assert.match(css, /\.cr-form-control[^}]*min-height:\s*48px/s);
  assert.match(css, /\.cr-attendance-choice[^}]*min-height:\s*56px/s);
  assert.match(css, /\.cr-form-submit[^}]*min-height:\s*48px/s);
  assert.match(css, /\.cr-gift-receipt[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-wish-entry[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|box-shadow/);
  assert.doesNotMatch(css, /\.cr-(?:rsvp|wishes|gift)[^{]*\{[^}]*border-radius/s);
});
