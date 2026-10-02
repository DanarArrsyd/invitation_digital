import assert from "node:assert/strict";
import test from "node:test";
import { getPublishReadiness } from "../src/lib/invitations/readiness.ts";

const allOff = {
  music: false, countdown: false, maps: false, story: false, gallery: false, dressCode: false,
  livestream: false, rsvp: false, wishes: false, gift: false, guestPersonalization: false,
};
const empty = {
  features: allOff, peopleCount: 0, eventCount: 0, hasCoverImage: false, hasMusic: false,
  galleryCount: 0, giftCount: 0, storyCount: 0, guestCount: 0,
};
const keys = (items) => items.map((item) => item.key);

test("people and events are required; the cover photo is recommended", () => {
  const items = getPublishReadiness(empty);
  assert.deepEqual(keys(items), ["people", "events", "cover"]);
  assert.deepEqual(items.map((item) => item.level), ["required", "required", "recommended"]);
  assert.ok(items.every((item) => !item.done));
});

test("feature-dependent items appear only when their section is switched on", () => {
  const features = { ...allOff, gallery: true, story: true, gift: true, music: true, guestPersonalization: true };
  assert.deepEqual(keys(getPublishReadiness({ ...empty, features })), [
    "people", "events", "cover", "gallery", "story", "gift", "music", "guests",
  ]);
});

test("items are done once their content exists", () => {
  const features = { ...allOff, gallery: true, gift: true, music: true, guestPersonalization: true, story: true };
  const items = getPublishReadiness({
    features, peopleCount: 2, eventCount: 1, hasCoverImage: true, hasMusic: true,
    galleryCount: 8, giftCount: 1, storyCount: 3, guestCount: 120,
  });
  assert.ok(items.every((item) => item.done), JSON.stringify(items.filter((item) => !item.done)));
});

test("every item links to an existing editor section", () => {
  const sections = new Set(["general", "people", "events", "content", "features", "gallery", "gifts", "guests", "responses", "publish"]);
  const features = Object.fromEntries(Object.keys(allOff).map((key) => [key, true]));
  for (const item of getPublishReadiness({ ...empty, features })) assert.ok(sections.has(item.section), item.section);
});
