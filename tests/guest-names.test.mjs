import assert from "node:assert/strict";
import test from "node:test";
import { createGuestsSchema, parseGuestNames } from "../src/lib/validation/guests.ts";

test("one name per line, trimmed, inner whitespace collapsed, blanks dropped", () => {
  assert.deepEqual(parseGuestNames("  Ibu Sari  \n\n\tBapak   Ahmad & keluarga\r\n  \n"), [
    "Ibu Sari",
    "Bapak Ahmad & keluarga",
  ]);
});

test("repeats inside the pasted list are dropped case-insensitively, first spelling wins", () => {
  assert.deepEqual(parseGuestNames("Rizky\nrizky\nRIZKY\nRizki"), ["Rizky", "Rizki"]);
});

test("empty input yields no names and the schema rejects it", () => {
  assert.deepEqual(parseGuestNames(" \n \n"), []);
  const parsed = createGuestsSchema.safeParse({
    invitationId: "00000000-0000-4000-8000-000000000001",
    names: [],
  });
  assert.equal(parsed.success, false);
});

test("the schema caps one submission and each name's length", () => {
  const invitationId = "00000000-0000-4000-8000-000000000001";
  const many = Array.from({ length: 501 }, (_, index) => `Tamu ${index}`);
  assert.equal(createGuestsSchema.safeParse({ invitationId, names: many }).success, false);
  assert.equal(createGuestsSchema.safeParse({ invitationId, names: ["x".repeat(201)] }).success, false);
  assert.equal(createGuestsSchema.safeParse({ invitationId, names: many.slice(0, 500) }).success, true);
});
