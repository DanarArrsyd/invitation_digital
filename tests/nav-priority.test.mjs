import assert from "node:assert/strict";
import test from "node:test";
import { MAX_NAV_ITEMS, pickNavItems } from "../src/themes/shared/nav-priority.ts";

const all = ["hero", "couple", "events", "story", "gallery", "rsvp", "wishes", "gift"].map((section) => ({ section }));

test("a full invitation keeps five guest-action items in page order", () => {
  assert.equal(MAX_NAV_ITEMS, 5);
  assert.deepEqual(pickNavItems(all).map((item) => item.section), ["hero", "events", "rsvp", "wishes", "gift"]);
});

test("fewer than five items are all kept, in page order", () => {
  const few = all.filter((item) => ["hero", "couple", "events", "rsvp"].includes(item.section));
  assert.deepEqual(pickNavItems(few), few);
});
