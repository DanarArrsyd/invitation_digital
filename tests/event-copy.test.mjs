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
