import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../scripts/demo/content.mjs";

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    encodeURIComponent,
    Date,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const entitlements = loadTs("lib/packages/entitlements.ts");
const navSections = loadTs("lib/packages/nav-sections.ts");
const timeZones = loadTs("lib/invitations/time-zones.ts");
const { buildQaFixture, QA_CONDITIONS, QA_DEFAULT_GUEST } = loadTs("lib/qa/fixture-invitation.ts", {
  "@/lib/packages/entitlements": entitlements,
  "@/lib/packages/nav-sections": navSections,
  "@/lib/invitations/time-zones": timeZones,
});

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };
const terra = DEMOS.find((demo) => demo.theme === "terra-botanica");
const build = (options = {}) => buildQaFixture(terra, library, {
  packageKey: "signature", type: "wedding", condition: "lengkap", guestName: QA_DEFAULT_GUEST, ...options,
});
const NON_WEDDING = ["birthday", "engagement", "aqiqah", "graduation", "corporate"];
// The demo seed's switches (scripts/demo/build-seed.mjs FEATURES).
const REQUESTED = {
  music: false, countdown: true, maps: true, story: true, gallery: true, dressCode: true,
  livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true,
};
const WEDDING_ONLY = /mempelai|pernikahan|the wedding of/i;

test("packages are applied with the production tiers and limits", () => {
  for (const packageKey of entitlements.PACKAGE_KEYS) {
    const { invitation } = build({ packageKey });
    const { limits } = entitlements.PACKAGE_DEFINITIONS[packageKey];
    assert.deepEqual([...invitation.navSections], [...navSections.NAV_SECTIONS_BY_PACKAGE[packageKey]]);
    assert.ok(invitation.events.length <= limits.maxEvents, `${packageKey} events`);
    assert.ok(invitation.gallery.length <= limits.maxGalleryImages, `${packageKey} gallery`);
    assert.ok(invitation.gallery.length > 0);
    assert.deepEqual(invitation.features, entitlements.resolveEffectiveInvitationFeatures(packageKey, REQUESTED));
    assert.deepEqual(invitation.theme.settings.features, invitation.features);
  }
});

test("a wedding fixture keeps the demo content as written", () => {
  const { invitation, guest } = build();
  assert.equal(invitation.title, terra.title);
  assert.deepEqual(invitation.people.map((person) => person.role), ["bride", "groom"]);
  assert.equal(invitation.events[0].title, terra.events[0].title);
  assert.equal(invitation.content.openingQuote, terra.opening_quote);
  assert.equal(invitation.theme.slug, "terra-botanica");
  assert.equal(guest.displayName, QA_DEFAULT_GUEST);
});

test("non-wedding fixtures carry no wedding-only words and the right cast", () => {
  for (const demo of DEMOS) {
    for (const type of NON_WEDDING) {
      for (const condition of QA_CONDITIONS) {
        const { invitation, guest } = buildQaFixture(demo, library, { packageKey: "grand", type, condition, guestName: QA_DEFAULT_GUEST });
        assert.equal(invitation.type, type);
        assert.doesNotMatch(JSON.stringify({ invitation, guest }), WEDDING_ONLY, `${demo.theme}/${type}/${condition} leaks wedding copy`);
      }
    }
  }
  assert.deepEqual(build({ type: "birthday" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "aqiqah" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "graduation" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "corporate" }).invitation.people.map((p) => p.role), ["host"]);
  assert.equal(build({ type: "engagement" }).invitation.people.length, 2);
});

test("minim keeps a valid shape with only the essentials", () => {
  const { invitation } = build({ condition: "minim", packageKey: "grand" });
  assert.equal(invitation.events.length, 1);
  for (const key of ["stories", "gallery", "gifts", "wishes"]) assert.equal(invitation[key].length, 0, key);
  assert.equal(invitation.content.openingQuote, null);
  for (const person of invitation.people) {
    assert.equal(person.fatherName, null);
    assert.equal(person.motherName, null);
  }
  for (const [key, value] of Object.entries(invitation)) assert.notEqual(value, undefined, key);
});

test("panjang stresses names, venues, wishes and the guest", () => {
  const { invitation, guest } = build({ condition: "panjang" });
  assert.ok(invitation.people[0].fullName.split(" ").some((word) => word.length >= 40), "an unbroken 40+ character word");
  assert.ok(invitation.events[0].venueName.length >= 50);
  assert.ok(invitation.wishes[0].message.length >= 300);
  assert.ok(guest.displayName.length >= 50);
});

test("a no-guest link renders without a guest", () => {
  assert.equal(build({ guestName: null }).guest, null);
  assert.deepEqual([...QA_CONDITIONS], ["lengkap", "minim", "panjang"]);
});

test("non-wedding fixtures carry no wedding wishes, love story or ceremony labels", () => {
  // Fixture text only: themes may render real guests' wishes, so this is not a runner check.
  const WEDDING_FLAVOUR = /menempuh hidup baru|sakinah|kalian berdua|cinta kalian|pasangan|sakral|akad|adat/i;
  for (const demo of DEMOS) {
    for (const type of ["birthday", "aqiqah", "graduation", "corporate"]) {
      const { invitation } = buildQaFixture(demo, library, { packageKey: "grand", type, condition: "lengkap", guestName: QA_DEFAULT_GUEST });
      const text = JSON.stringify([invitation.wishes, invitation.stories, invitation.events.map((event) => event.eventType)]);
      assert.doesNotMatch(text, WEDDING_FLAVOUR, `${demo.theme}/${type}`);
      assert.ok(invitation.stories.length > 0 && invitation.wishes.length > 0, "sections keep content");
    }
    const engagement = buildQaFixture(demo, library, { packageKey: "grand", type: "engagement", condition: "lengkap", guestName: QA_DEFAULT_GUEST }).invitation;
    assert.doesNotMatch(JSON.stringify([engagement.wishes, engagement.events.map((event) => event.eventType)]), /menempuh hidup baru|sakinah|sakral|akad|adat/i, `${demo.theme}/engagement`);
  }
});
