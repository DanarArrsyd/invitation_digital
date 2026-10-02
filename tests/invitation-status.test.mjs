import assert from "node:assert/strict";
import test from "node:test";
import { effectiveInvitationStatus } from "../src/lib/invitations/status.ts";

const now = Date.parse("2026-10-02T12:00:00Z");

test("a published invitation past its expires_at reports as expired", () => {
  assert.equal(effectiveInvitationStatus("published", "2026-10-02T11:59:59Z", now), "expired");
  assert.equal(effectiveInvitationStatus("published", "2026-10-02T12:00:00Z", now), "expired");
});

test("a published invitation before expiry, or without one, stays published", () => {
  assert.equal(effectiveInvitationStatus("published", "2026-12-13T12:48:49Z", now), "published");
  assert.equal(effectiveInvitationStatus("published", null, now), "published");
  assert.equal(effectiveInvitationStatus("published", undefined, now), "published");
});

test("other stored statuses pass through regardless of expires_at", () => {
  for (const status of ["draft", "expired", "archived"]) {
    assert.equal(effectiveInvitationStatus(status, "2020-01-01T00:00:00Z", now), status);
  }
});

test("unknown statuses fall back to draft instead of breaking the badge", () => {
  assert.equal(effectiveInvitationStatus("something-new", null, now), "draft");
});
