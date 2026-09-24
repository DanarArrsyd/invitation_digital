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

function loadShared(name) {
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
          trackCoverOpenedAction: async () => undefined,
          submitRsvpAction: async () => ({ status: "success" }),
          submitWishAction: async () => ({ status: "success" }),
        };
      }
      return nodeRequire(name);
    },
    setTimeout,
    clearTimeout,
    navigator: globalThis.navigator,
  });
  return exports;
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

test("copy feedback remains false when the browser denies clipboard access", async () => {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, "clipboard");
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error("permission denied")) },
  });
  const { useCopyFeedback } = loadShared("use-copy-feedback");
  const hook = await renderHook(() => useCopyFeedback());
  try {
    await act(async () => hook.current.copy("123456"));
    assert.equal(hook.current.copied, false);
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
