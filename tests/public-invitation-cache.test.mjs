import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function createLoader() {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/server/public/invitation-loader.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;

  const queryCount = new Map();
  let normalizeCalls = 0;
  const cache = new Map();

  const invitation = {
    id: "invitation-id",
    slug: "rayhana-febri",
    status: "published",
    expires_at: null,
    event_date: "2026-10-20",
    title: "Rayhana & Febri",
    theme: { slug: "nusantara-ivory" },
  };
  const normalized = {
    id: invitation.id,
    slug: invitation.slug,
    title: invitation.title,
    expiresAt: invitation.expires_at,
    eventDate: invitation.event_date,
    people: [],
  };

  function count(table) {
    queryCount.set(table, (queryCount.get(table) ?? 0) + 1);
  }

  function createSupabaseAdminClient() {
    return {
      from(table) {
        count(table);
        const filters = new Map();
        const query = {
          select() {
            return query;
          },
          eq(key, value) {
            filters.set(key, value);
            return query;
          },
          async maybeSingle() {
            if (table === "invitations") {
              return filters.get("slug") === invitation.slug
                ? { data: invitation, error: null }
                : { data: null, error: null };
            }
            if (table === "guests") {
              const token = filters.get("token");
              return {
                data: { id: `guest-${token}`, display_name: token, token, notes: null },
                error: null,
              };
            }
            return { data: null, error: null };
          },
        };
        return query;
      },
    };
  }

  function unstableCache(fn, keyParts) {
    return async () => {
      const key = JSON.stringify(keyParts);
      if (!cache.has(key)) cache.set(key, await fn());
      return cache.get(key);
    };
  }

  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (name === "next/cache") return { unstable_cache: unstableCache };
      if (name.includes("supabase/admin")) return { createSupabaseAdminClient };
      if (name.includes("utils/coupleName")) return { getCoupleDisplayName: () => invitation.title };
      if (name === "./normalize") {
        return {
          async loadNormalizedInvitation() {
            normalizeCalls += 1;
            return normalized;
          },
        };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });

  return { getPublicInvitationBySlug: exports.getPublicInvitationBySlug, queryCount, getNormalizeCalls: () => normalizeCalls };
}

test("reuses invitation content while resolving each guest independently", async () => {
  const { getPublicInvitationBySlug, queryCount, getNormalizeCalls } = createLoader();

  const first = await getPublicInvitationBySlug("rayhana-febri", "guest-a");
  const second = await getPublicInvitationBySlug("rayhana-febri", "guest-b");

  assert.equal(first.guest.displayName, "guest-a");
  assert.equal(second.guest.displayName, "guest-b");
  assert.equal(queryCount.get("invitations"), 1);
  assert.equal(queryCount.get("guests"), 2);
  assert.equal(getNormalizeCalls(), 1);
});

test("does not share cached content between slugs", async () => {
  const { getPublicInvitationBySlug, queryCount } = createLoader();

  await getPublicInvitationBySlug("rayhana-febri");
  await getPublicInvitationBySlug("missing");

  assert.equal(queryCount.get("invitations"), 2);
});
