import assert from "node:assert/strict";
import test from "node:test";
import { NAV_SECTIONS_BY_PACKAGE } from "../src/lib/packages/nav-sections.ts";
import { pickNavItems } from "../src/themes/shared/nav-priority.ts";

const all = ["hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift"].map((section) => ({
  section,
}));
const sections = (items) => items.map((item) => item.section);

test("each package shows its own stops, in page order", () => {
  assert.deepEqual(sections(pickNavItems(all, NAV_SECTIONS_BY_PACKAGE.intimate)), ["hero", "couple", "events", "rsvp", "gift"]);
  assert.deepEqual(sections(pickNavItems(all, NAV_SECTIONS_BY_PACKAGE.signature)), [
    "hero", "couple", "events", "gallery", "rsvp", "wishes", "gift",
  ]);
  assert.deepEqual(sections(pickNavItems(all, NAV_SECTIONS_BY_PACKAGE.grand)), [
    "hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift",
  ]);
});

test("a higher package keeps every stop of the one below and adds more", () => {
  const tiers = ["intimate", "signature", "grand"].map((key) => NAV_SECTIONS_BY_PACKAGE[key]);
  for (let index = 1; index < tiers.length; index += 1) {
    for (const section of tiers[index - 1]) assert.ok(tiers[index].includes(section), `${section} survives the upgrade`);
    assert.ok(tiers[index].length > tiers[index - 1].length);
  }
  assert.ok(NAV_SECTIONS_BY_PACKAGE.intimate.includes("couple"), "Mempelai is in every package");
});

test("sections the invitation doesn't render drop out without reordering", () => {
  const few = all.filter((item) => ["hero", "events", "rsvp"].includes(item.section));
  assert.deepEqual(pickNavItems(few, NAV_SECTIONS_BY_PACKAGE.grand), few);
  assert.deepEqual(sections(pickNavItems(few, NAV_SECTIONS_BY_PACKAGE.intimate)), ["hero", "events", "rsvp"]);
});

test("without a stop list every rendered section is kept", () => {
  assert.equal(pickNavItems(all, undefined).length, all.length);
});
