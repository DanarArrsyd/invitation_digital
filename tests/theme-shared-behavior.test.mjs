import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";

const nodeRequire = createRequire(import.meta.url);

function loadShared(name, actions = {}) {
  const file = new URL(`../src/themes/shared/${name}.ts`, import.meta.url);
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    module: { exports },
    require(name) {
      if (name === "motion/react") return { useReducedMotion: () => false };
      if (name === "@/app/(public)/[slug]/actions") {
        return {
          trackCoverOpenedAction: actions.trackCoverOpened ?? (async () => undefined),
          submitRsvpAction: actions.submitRsvp ?? (async () => ({ status: "success" })),
          submitWishAction: actions.submitWish ?? (async () => ({ status: "success" })),
        };
      }
      return nodeRequire(name);
    },
    setTimeout,
    clearTimeout,
    get FormData() { return globalThis.FormData; },
    navigator: globalThis.navigator,
  });
  return exports;
}

function loadSection(theme, name, actions = {}) {
  const directory = theme === "ivory" ? "nusantara-ivory" : "terra-botanica";
  const source = readFileSync(new URL(`../src/themes/${directory}/sections/${name}.tsx`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  const shared = loadShared("use-public-forms", actions);
  const passthrough = ({ children, id }) => React.createElement(id ? "section" : "div", id ? { id } : null, children);
  const inert = () => null;
  vm.runInNewContext(compiled, {
    exports, module: { exports }, FormData: globalThis.FormData,
    require(moduleName) {
      if (moduleName === "@/themes/shared/use-public-forms") return shared;
      if (moduleName === "@/components/TurnstileWidget") return { TurnstileWidget: inert };
      if (moduleName.endsWith("/Reveal")) return { Reveal: passthrough };
      if (moduleName.endsWith("/Section")) return { Section: passthrough };
      if (moduleName.endsWith("/SectionHeading")) return { SectionHeading: ({ title }) => React.createElement("h2", null, title) };
      if (moduleName.endsWith("/Ornament")) return { OrnamentCorner: inert, OrnamentDivider: inert };
      if (moduleName.endsWith("/Botanical")) return { FloralCorner: inert, BotanicalDivider: inert };
      if (moduleName.endsWith("/MelatiShower")) return { MelatiShower: () => React.createElement("div", { "data-ni-melati": "" }) };
      return nodeRequire(moduleName);
    },
  });
  return exports[name];
}

async function mountSection(theme, name, props, actions = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/" });
  const prior = { window: globalThis.window, document: globalThis.document, HTMLElement: globalThis.HTMLElement, FormData: globalThis.FormData, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true });
  const Component = loadSection(theme, name, actions);
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(Component, props)));
  return { document: dom.window.document, async cleanup() { await act(async () => root.unmount()); Object.assign(globalThis, prior); dom.window.close(); } };
}

async function mountIvorySection(name, props, actions = {}) {
  return mountSection("ivory", name, props, actions);
}

async function typeInto(element, value) {
  const browser = element.ownerDocument.defaultView;
  const prototype = element.tagName === "TEXTAREA" ? browser.HTMLTextAreaElement.prototype : browser.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
  await act(async () => element.dispatchEvent(new browser.Event("input", { bubbles: true })));
}

async function renderHook(useHook, render = () => null) {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>");
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  let current;
  function Host() {
    current = useHook();
    return render(current);
  }
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(Host)));
  return {
    get current() { return current; },
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, previous);
      dom.window.close();
    },
  };
}

test("wish pagination stops at zero and the final page", () => {
  const { nextVisibleWishCount } = loadShared("use-public-forms");
  assert.equal(typeof nextVisibleWishCount, "function");
  for (const [current, total, expected] of [
    [0, 0, 0],
    [0, 1, 1],
    [0, 5, 5],
    [5, 6, 6],
    [5, 500, 10],
    [500, 500, 500],
  ]) {
    assert.equal(nextVisibleWishCount(current, total, 5), expected);
  }
});

test("audio play reports acceptance and handles autoplay rejection", async () => {
  const { attemptAudioPlay } = loadShared("use-invitation-cover");
  assert.equal(typeof attemptAudioPlay, "function");
  assert.equal(await attemptAudioPlay({ play: () => Promise.resolve() }), true);
  assert.equal(await attemptAudioPlay({ play: () => Promise.reject(new Error("autoplay blocked")) }), false);
  assert.equal(await attemptAudioPlay({ play: () => { throw new Error("unavailable"); } }), false);
});

test("clipboard rejection never reports successful copying", async () => {
  const { attemptClipboardCopy } = loadShared("use-copy-feedback");
  assert.equal(typeof attemptClipboardCopy, "function");
  const rejected = { writeText: () => Promise.reject(new Error("permission denied")) };
  assert.equal(await attemptClipboardCopy("123456", rejected), false);
  const accepted = { writeText: () => Promise.resolve() };
  assert.equal(await attemptClipboardCopy("123456", accepted), true);
});

test("cover opens and focuses content when autoplay is rejected", async () => {
  const { useInvitationCover } = loadShared("use-invitation-cover");
  const hook = await renderHook(
    () => useInvitationCover({ invitationId: "invitation-1", guestToken: null, musicEnabled: true, musicUrl: "/music.mp3" }),
    (cover) => cover.opened ? React.createElement("div", { ref: cover.contentRef, tabIndex: -1 }) : null,
  );
  try {
    hook.current.audioRef.current = { play: () => Promise.reject(new Error("autoplay blocked")) };
    await act(async () => hook.current.openInvitation());
    assert.equal(hook.current.opened, true);
    assert.equal(hook.current.playing, false);
    assert.equal(document.activeElement, hook.current.contentRef.current);
  } finally {
    await hook.cleanup();
  }
});

test("openInvitation is idempotent: repeat calls track and play only once", async () => {
  let tracked = 0;
  let played = 0;
  const { useInvitationCover } = loadShared("use-invitation-cover", { trackCoverOpened: async () => { tracked += 1; } });
  const hook = await renderHook(
    () => useInvitationCover({ invitationId: "invitation-1", guestToken: null, musicEnabled: true, musicUrl: "/music.mp3" }),
  );
  try {
    hook.current.audioRef.current = { play: () => { played += 1; return Promise.resolve(); } };
    const open = hook.current.openInvitation;
    await act(async () => { open(); open(); });
    await act(async () => hook.current.openInvitation());
    assert.equal(tracked, 1);
    assert.equal(played, 1);
  } finally {
    await hook.cleanup();
  }
});

test("copy feedback remains false when the browser denies clipboard access", async () => {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, "clipboard");
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error("permission denied")) },
  });
  const { useCopyFeedback } = loadShared("use-copy-feedback");
  const hook = await renderHook(() => useCopyFeedback());
  try {
    let result;
    await act(async () => { result = await hook.current.copy("123456"); });
    assert.equal(result, false);
    assert.equal(hook.current.copied, false);
    assert.equal(hook.current.failed, true, "a blocked clipboard is reported so themes can offer a fallback");
  } finally {
    await hook.cleanup();
    if (clipboardDescriptor) Object.defineProperty(globalThis.navigator, "clipboard", clipboardDescriptor);
    else delete globalThis.navigator.clipboard;
  }
});

test("public form controllers expose action state and RSVP attendance", async () => {
  const { useRsvpForm, useWishForm } = loadShared("use-public-forms");
  const rsvp = await renderHook(() => useRsvpForm());
  try {
    assert.equal(rsvp.current.state.status, "idle");
    assert.equal(typeof rsvp.current.formAction, "function");
    assert.equal(rsvp.current.isPending, false);
    await act(async () => rsvp.current.setAttendance("attending"));
    assert.equal(rsvp.current.attendance, "attending");
  } finally {
    await rsvp.cleanup();
  }
  const wish = await renderHook(() => useWishForm());
  try {
    assert.equal(wish.current.state.status, "idle");
    assert.equal(typeof wish.current.formAction, "function");
    assert.equal(wish.current.isPending, false);
  } finally {
    await wish.cleanup();
  }
});

test("wish pagination controller reveals five more and caps the final page", async () => {
  const { useWishPagination } = loadShared("use-public-forms");
  const hook = await renderHook(() => useWishPagination(6, 5));
  try {
    assert.equal(hook.current.visibleCount, 5);
    await act(async () => hook.current.showMore());
    assert.equal(hook.current.visibleCount, 6);
    await act(async () => hook.current.showMore());
    assert.equal(hook.current.visibleCount, 6);
  } finally {
    await hook.cleanup();
  }
});

test("wish pagination retains the first-page allowance when initially empty", async () => {
  const { useWishPagination } = loadShared("use-public-forms");
  const hook = await renderHook(() => useWishPagination(0, 5));
  try {
    assert.equal(hook.current.visibleCount, 5);
  } finally {
    await hook.cleanup();
  }
});

test("shared RSVP behavior reaches the real Ivory form and retains its entered name on error", async () => {
  let resolveAction;
  const calls = [];
  const view = await mountIvorySection("RsvpSection", { invitationId: "inv-ivory", slug: "ivory", guestToken: null, guestName: null }, {
    submitRsvp: async (previous, data) => {
      calls.push(Object.fromEntries(data.entries()));
      return new Promise(resolve => { resolveAction = resolve; });
    },
  });
  try {
    const form = view.document.querySelector("#ni-rsvp form");
    form.elements.namedItem("guestName").value = "Tamu Ivory";
    await act(async () => form.querySelector('input[type="radio"][value="attending"]').click());
    await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
    assert.deepEqual(calls[0], { invitationId: "inv-ivory", slug: "ivory", guestToken: "", attendance: "attending", guestName: "Tamu Ivory" });
    assert.match(form.textContent, /Mengirim\.\.\./);
    await act(async () => resolveAction({ status: "error", message: "Coba lagi." }));
    assert.equal(form.querySelector('[role="alert"]').textContent, "Coba lagi.");
    assert.equal(form.elements.namedItem("guestName").value, "Tamu Ivory");
    assert.equal(form.elements.namedItem("attendance").value, "attending");
  } finally { await view.cleanup(); }
});

for (const [attendance, showsMelati] of [["attending", true], ["not_attending", false]]) {
  test(`Ivory RSVP success (${attendance}) thanks the guest${showsMelati ? " with falling melati" : ""}`, async () => {
    const view = await mountIvorySection("RsvpSection", { invitationId: "inv-ivory", slug: "ivory", guestToken: "t", guestName: "Bude Sri" }, {
      submitRsvp: async () => ({ status: "success" }),
    });
    try {
      const form = view.document.querySelector("#ni-rsvp form");
      await act(async () => form.querySelector(`input[type="radio"][value="${attendance}"]`).click());
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      const section = view.document.getElementById("ni-rsvp");
      assert.match(section.querySelector('[role="status"]').textContent, /Matur nuwun/);
      assert.match(section.textContent, /Konfirmasi kehadiran Anda telah kami terima/);
      assert.equal(Boolean(section.querySelector("[data-ni-melati]")), showsMelati);
    } finally { await view.cleanup(); }
  });
}

test("shared wish behavior reaches the real Ivory form and pagination", async () => {
  let resolveAction;
  const calls = [];
  const wishes = Array.from({ length: 6 }, (_, index) => ({ id: `wish-${index}`, guestName: `Tamu ${index}`, message: `Doa ${index}`, createdAt: "2026-09-25T00:00:00Z" }));
  const view = await mountIvorySection("WishesSection", { invitationId: "inv-ivory", slug: "ivory", guestToken: "ivory-token", guestName: "Tamu Undangan", wishes }, {
    submitWish: async (previous, data) => {
      calls.push(Object.fromEntries(data.entries()));
      return new Promise(resolve => { resolveAction = resolve; });
    },
  });
  try {
    const section = view.document.getElementById("ni-ucapan");
    const form = section.querySelector("form");
    form.elements.namedItem("message").value = "Pesan Ivory";
    await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
    assert.deepEqual(calls[0], { invitationId: "inv-ivory", slug: "ivory", guestToken: "ivory-token", message: "Pesan Ivory" });
    await act(async () => resolveAction({ status: "error", message: "Belum terkirim." }));
    assert.equal(form.querySelector('[role="alert"]').textContent, "Belum terkirim.");
    assert.equal(form.elements.namedItem("message").value, "Pesan Ivory");
    assert.equal(section.textContent.includes("Doa 5"), false);
    await act(async () => [...section.querySelectorAll("button")].find(button => button.textContent.includes("Muat Lebih Banyak")).click());
    assert.equal(section.textContent.includes("Doa 5"), true);
    assert.equal([...section.querySelectorAll("button")].some(button => button.textContent.includes("Muat Lebih Banyak")), false);
  } finally { await view.cleanup(); }
});

for (const theme of ["ivory", "terra"]) {
  test(`${theme} shared RSVP keeps newer guest-name edits made while pending`, async () => {
    const id = theme === "ivory" ? "ni-rsvp" : "tb-rsvp";
    const submissions = [];
    const resolvers = [];
    const view = await mountSection(theme, "RsvpSection", { invitationId: "invitation", slug: "sample", guestToken: null, guestName: null }, {
      submitRsvp: async (previous, data) => {
        submissions.push(Object.fromEntries(data.entries()));
        return new Promise(resolve => resolvers.push(resolve));
      },
    });
    try {
      const form = view.document.querySelector(`#${id} form`);
      const name = form.elements.namedItem("guestName");
      await typeInto(name, "Original RSVP");
      // Ivory uses a native radio group; Terra keeps its pressed-button pair.
      const attending = theme === "ivory"
        ? form.querySelector('input[type="radio"][value="attending"]')
        : [...form.querySelectorAll('button[type="button"]')].find(button => button.textContent.trim() === "Hadir");
      await act(async () => attending.click());
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      assert.equal(submissions[0].guestName, "Original RSVP");
      await typeInto(name, "Newer RSVP");
      assert.equal(name.value, "Newer RSVP");
      await act(async () => resolvers.shift()({ status: "error", message: "Coba lagi." }));
      assert.equal(name.value, "Newer RSVP", "the later edit must survive the error");
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      assert.equal(submissions[1].guestName, "Newer RSVP");
      await act(async () => resolvers.shift()({ status: "error", message: "Coba lagi." }));
      assert.equal(name.value, "Newer RSVP", "no-new-edit retry keeps the submitted value");
    } finally { await view.cleanup(); }
  });

  test(`${theme} shared wishes keep newer name and message edits made while pending`, async () => {
    const id = theme === "ivory" ? "ni-ucapan" : "tb-ucapan";
    const submissions = [];
    const resolvers = [];
    const view = await mountSection(theme, "WishesSection", { invitationId: "invitation", slug: "sample", guestToken: null, guestName: null, wishes: [] }, {
      submitWish: async (previous, data) => {
        submissions.push(Object.fromEntries(data.entries()));
        return new Promise(resolve => resolvers.push(resolve));
      },
    });
    try {
      const form = view.document.querySelector(`#${id} form`);
      const name = form.elements.namedItem("guestName");
      const message = form.elements.namedItem("message");
      await typeInto(name, "Original Name");
      await typeInto(message, "Original Message");
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      assert.equal(submissions[0].guestName, "Original Name");
      assert.equal(submissions[0].message, "Original Message");
      await typeInto(name, "Newer Name");
      await typeInto(message, "Newer Message");
      await act(async () => resolvers.shift()({ status: "error", message: "Coba lagi." }));
      assert.deepEqual(
        { guestName: name.value, message: message.value },
        { guestName: "Newer Name", message: "Newer Message" },
        "later name and wish edits must survive",
      );
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      assert.equal(submissions[1].guestName, "Newer Name");
      assert.equal(submissions[1].message, "Newer Message");
      await act(async () => resolvers.shift()({ status: "error", message: "Coba lagi." }));
      assert.equal(name.value, "Newer Name", "no-new-edit retry keeps the submitted name");
      assert.equal(message.value, "Newer Message", "no-new-edit retry keeps the submitted wish");
    } finally { await view.cleanup(); }
  });
}
