import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isPersonRole, normalizePersonRole, PERSON_ROLES } from "../src/lib/invitations/person-role.ts";

test("hand-typed roles fold back to the keys themes compare against", () => {
  assert.equal(normalizePersonRole("Groom"), "groom");
  assert.equal(normalizePersonRole("  BRIDE "), "bride");
  assert.ok(isPersonRole(normalizePersonRole("Groom")));
  assert.equal(isPersonRole("pria"), false);
  assert.deepEqual([...PERSON_ROLES], ["bride", "groom", "celebrant", "host", "speaker"]);
});

test("public data and admin input both normalize the role", () => {
  const normalize = readFileSync(new URL("../src/server/public/normalize.ts", import.meta.url), "utf8");
  assert.match(normalize, /role: normalizePersonRole\(p\.role\)/);
  const schema = readFileSync(new URL("../src/lib/validation/people.ts", import.meta.url), "utf8");
  assert.match(schema, /role: z\.string\(\)\.trim\(\)\.toLowerCase\(\)\.pipe\(z\.enum\(PERSON_ROLES/);
  const page = readFileSync(new URL("../src/app/admin/(protected)/(shell)/invitations/[id]/people/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /name="role"[^>]*placeholder="bride \/ groom"/, "no free-text role input");
  assert.match(page, /<PersonRoleSelect/);
});
