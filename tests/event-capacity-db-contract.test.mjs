import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);

const migrationPath = new URL(
  "../supabase/migrations/20260923000001_atomic_event_capacity.sql",
  import.meta.url,
);

test("event inserts lock the invitation before counting against package capacity", () => {
  assert.ok(existsSync(migrationPath), "an atomic event capacity migration exists");
  const migration = readFileSync(migrationPath, "utf8");
  assert.match(
    migration,
    /create trigger enforce_invitation_event_capacity\s+before insert on public\.invitation_events\s+for each row execute function public\.enforce_invitation_event_capacity\(\)/i,
  );

  const body = migration.match(
    /create or replace function public\.enforce_invitation_event_capacity\(\)[\s\S]*?as \$\$([\s\S]*?)\$\$/i,
  )?.[1];
  assert.ok(body, "capacity trigger function exists");
  assert.match(migration, /language plpgsql\s+volatile\s+security invoker\s+set search_path = ''/i);

  const lock = body.search(/from public\.invitations[\s\S]*?where id = new\.invitation_id\s+for update/i);
  const count = body.search(/select count\(\*\)[\s\S]*?from public\.invitation_events[\s\S]*?where invitation_id = new\.invitation_id/i);
  const reject = body.search(/if event_count >= event_limit then[\s\S]*?raise exception/i);
  assert.ok(lock >= 0, "the parent row is locked");
  assert.ok(count > lock, "the event count is read after acquiring the parent lock");
  assert.ok(reject > count, "the insert is rejected while the lock is held");
  assert.match(body, /when 'intimate' then 2/i);
  assert.match(body, /when 'signature' then 3/i);
  assert.match(body, /when 'grand' then 5/i);
  assert.match(body, /Paket %s mendukung maksimal %s acara\./i);
});

test("the admin mutation returns the database capacity error unchanged", async () => {
  const capacityMessage = "Paket Intimate mendukung maksimal 2 acara.";
  const entitlementsSource = ts.transpileModule(
    readFileSync(new URL("../src/lib/packages/entitlements.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const entitlements = {};
  vm.runInNewContext(entitlementsSource, {
    exports: entitlements,
    module: { exports: entitlements },
  });

  const mutationsSource = ts.transpileModule(
    readFileSync(new URL("../src/server/invitations/mutations.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const mutations = {};
  vm.runInNewContext(mutationsSource, {
    exports: mutations,
    module: { exports: mutations },
    require(name) {
      if (name === "node:crypto") return nodeRequire(name);
      if (name === "@/lib/packages/entitlements") return entitlements;
      if (name === "@/lib/supabase/server") {
        return {
          createSupabaseServerClient: async () => ({
            from(table) {
              if (table === "invitations") {
                return {
                  select: () => ({
                    eq: () => ({ single: async () => ({ data: { package_key: "intimate" }, error: null }) }),
                  }),
                };
              }
              if (table === "invitation_events") {
                return {
                  select: () => ({
                    eq: async () => ({ count: 1, error: null }),
                  }),
                  insert: async () => ({ error: { code: "P0001", message: capacityMessage } }),
                };
              }
              throw new Error(`Unexpected table: ${table}`);
            },
          }),
        };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });

  const result = await mutations.upsertEvent({
    invitationId: "dd16a82d-b0f9-4c94-9003-984cdb763a8e",
    eventType: null,
    title: "Reception",
    eventDate: "2026-10-20",
    startTime: null,
    endTime: null,
    venueName: null,
    address: null,
    mapsUrl: null,
    livestreamUrl: null,
    sortOrder: 1,
  });

  assert.equal(result.error, capacityMessage);
});
