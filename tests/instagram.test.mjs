import assert from "node:assert/strict";
import test from "node:test";
import { normalizeInstagramProfile, getPersonInstagram } from "../src/lib/utils/instagram.ts";

test("normalizes handles and profile URLs to a safe canonical link", () => {
  for (const value of ["@nama.uji", "nama.uji", " https://www.instagram.com/nama.uji/?igsh=example "]) {
    assert.deepEqual(normalizeInstagramProfile(value), { username: "nama.uji", url: "https://www.instagram.com/nama.uji/" });
  }
});
test("rejects unsafe URLs, other hosts, content links and malformed data", () => {
  for (const value of [null, undefined, {}, "", "javascript:alert(1)", "https://instagram.com.evil.test/name", "https://evil.test/name", "https://user@instagram.com/name", "http://instagram.com/name", "https://instagram.com/p/post", "https://instagram.com/name/extra", "name with spaces", "../name", "a".repeat(31)]) {
    assert.equal(normalizeInstagramProfile(value), null);
  }
});
test("reads only the requested person and handles absent settings", () => {
  const settings = { features: { gallery: true }, personSocials: { first: { instagram: "@first" }, second: { instagram: "@second" } } };
  assert.equal(getPersonInstagram(settings, "first")?.username, "first");
  assert.equal(getPersonInstagram(settings, "second")?.username, "second");
  for (const settings of [undefined, null, [], {}, {personSocials: []}, {personSocials: { first: {instagram: "javascript:alert(1)"}}}]) {
    assert.equal(getPersonInstagram(settings, "first"), null);
  }
});
