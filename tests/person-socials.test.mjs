import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { normalizeInstagramProfile } from "../src/lib/utils/instagram.ts";

const source = ts.transpileModule(readFileSync(new URL("../src/server/invitations/person-socials.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
async function run({ user = true, person = true, conflict = false, instagram = "@nama.uji" } = {}) {
  const settings = { features: { gallery: false }, expiration: { monthsAfterPublish: 3 }, personSocials: { other: { instagram: "@other" }, person: { instagram: "@old", note: "keep" } } };
  const writes = [];
  const filters = [];
  const supabase = {
    auth: { getUser: async () => ({ data: { user: user ? {id: "admin"} : null } }) },
    from(table) {
      let write = false;
      const query = {
        select() { return query; },
        eq(key, value) { filters.push([table, key, value]); return query; },
        update(value) { write = true; writes.push(value); return query; },
        async maybeSingle() { return {data: table === "invitation_people" ? (person ? {id: "person"} : null) : write ? (conflict ? null : {id: "invitation"}) : {settings, updated_at: "version"}, error: null}; },
      };
      return query;
    },
  };
  const exports = {};
  vm.runInNewContext(source, { exports, URL, require(name) {
    if (name.includes("supabase/server")) return {createSupabaseServerClient: async () => supabase};
    if (name.includes("utils/instagram")) return {normalizeInstagramProfile};
    throw new Error(name);
  } });
  const result = await exports.updatePersonInstagram({invitationId: "invitation", personId: "person", instagram});
  return {result, writes, filters, settings};
}
test("requires authentication and person ownership before updating settings", async () => {
  for (const options of [{user: false}, {person: false}]) {
    const {result, writes} = await run(options);
    assert.ok(result?.error);
    assert.equal(writes.length, 0);
  }
});
test("updates only the requested Instagram and preserves other settings", async () => {
  const {result, writes, filters, settings} = await run();
  assert.equal(result, null);
  assert.equal(JSON.stringify(writes[0].settings.features), JSON.stringify(settings.features));
  assert.equal(JSON.stringify(writes[0].settings.expiration), JSON.stringify(settings.expiration));
  assert.equal(writes[0].settings.personSocials.other.instagram, "@other");
  assert.equal(writes[0].settings.personSocials.person.instagram, "https://www.instagram.com/nama.uji/");
  assert.equal(writes[0].settings.personSocials.person.note, "keep");
  assert.ok(filters.some(([table,key,value]) => table === "invitation_people" && key === "invitation_id" && value === "invitation"));
  assert.ok(filters.some(([table,key,value]) => table === "invitations" && key === "updated_at" && value === "version"));
});
test("clearing hides Instagram without removing other people's settings", async () => {
  const {result, writes} = await run({instagram: ""});
  assert.equal(result, null);
  assert.equal(writes[0].settings.personSocials.person.instagram, undefined);
  assert.equal(writes[0].settings.personSocials.other.instagram, "@other");
});
test("rejects unsafe input and reports concurrent updates", async () => {
  const invalid = await run({instagram: "javascript:alert(1)"});
  assert.ok(invalid.result?.error);
  assert.equal(invalid.writes.length, 0);
  assert.ok((await run({conflict: true})).result?.error);
});
