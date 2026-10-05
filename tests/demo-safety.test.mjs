import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const invitationId = "00000000-0000-4000-8000-000000000001";

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    URL,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "server-only") return {};
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

function fakeSupabase(invitation) {
  const writes = [];
  const reads = [];
  const supabase = {
    from(table) {
      reads.push(table);
      if (table === "invitations") {
        const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: invitation, error: null }) };
        return query;
      }
      if (table === "guests") {
        const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: null, error: null }) };
        return query;
      }
      return {
        insert: async (row) => {
          writes.push({ table, row });
          return { error: null };
        },
      };
    },
  };
  return { supabase, writes, reads };
}

const entitlements = loadTs("lib/packages/entitlements.ts");
const demoInvitation = {
  id: invitationId,
  status: "draft",
  is_demo: true,
  package_key: "signature",
  settings: { features: { wishes: true } },
};

function loadSubmitters(supabase, turnstileCalls) {
  const shared = {
    "@/lib/analytics/session": { getSessionId: async () => "session" },
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => supabase },
    "@/lib/security/sanitize": { sanitizePlainText: (value) => value.trim() },
    "@/lib/turnstile/verify": {
      verifyTurnstileToken: async () => {
        turnstileCalls.push(1);
        return true;
      },
    },
    "./analytics": { trackEvent: async () => {} },
  };
  const { submitRsvp } = loadTs("server/public/rsvp.ts", {
    ...shared,
    "@/lib/validation/public-rsvp": loadTs("lib/validation/public-rsvp.ts", { zod: nodeRequire("zod") }),
  });
  const { submitWish } = loadTs("server/public/wishes.ts", {
    ...shared,
    "@/lib/validation/public-wish": loadTs("lib/validation/public-wish.ts", { zod: nodeRequire("zod") }),
    "@/lib/packages/entitlements": entitlements,
  });
  return { submitRsvp, submitWish };
}

test("RSVPs and wishes on a demo invitation succeed without writing anything", async () => {
  const { supabase, writes } = fakeSupabase(demoInvitation);
  const turnstileCalls = [];
  const { submitRsvp, submitWish } = loadSubmitters(supabase, turnstileCalls);

  const rsvp = await submitRsvp({ invitationId, guestName: "Tamu", attendance: "attending", turnstileToken: "t" });
  const wish = await submitWish({ invitationId, guestName: "Tamu", message: "Selamat!", turnstileToken: "t" });

  assert.deepEqual({ ...rsvp }, { ok: true });
  assert.deepEqual({ ...wish }, { ok: true });
  assert.equal(writes.length, 0);
  assert.equal(turnstileCalls.length, 0, "demos never spend a Turnstile verification");
});

test("a real published invitation still records the RSVP", async () => {
  const { supabase, writes } = fakeSupabase({ ...demoInvitation, status: "published", is_demo: false });
  const { submitRsvp } = loadSubmitters(supabase, []);
  const result = await submitRsvp({ invitationId, guestName: "Tamu", attendance: "attending", turnstileToken: "t" });
  assert.equal(result.ok, true);
  assert.deepEqual(
    writes.map((write) => write.table),
    ["rsvps"],
  );
});

test("demo forms work without a Turnstile token (the widget may not have loaded)", async () => {
  const { supabase, writes } = fakeSupabase(demoInvitation);
  const { submitRsvp, submitWish } = loadSubmitters(supabase, []);
  const rsvp = await submitRsvp({ invitationId, guestName: "Tamu", attendance: "attending" });
  const wish = await submitWish({ invitationId, guestName: "Tamu", message: "Tess doa" });
  assert.deepEqual({ ...rsvp }, { ok: true });
  assert.deepEqual({ ...wish }, { ok: true });
  assert.equal(writes.length, 0);
});

test("a real invitation without a Turnstile token gets a readable Indonesian message", async () => {
  const { supabase, writes } = fakeSupabase({ ...demoInvitation, status: "published", is_demo: false });
  const turnstileCalls = [];
  const { submitRsvp, submitWish } = loadSubmitters(supabase, turnstileCalls);
  for (const result of [
    await submitRsvp({ invitationId, guestName: "Tamu", attendance: "attending" }),
    await submitWish({ invitationId, guestName: "Tamu", message: "Selamat!" }),
  ]) {
    assert.equal(result.ok, false);
    assert.match(result.error, /Verifikasi keamanan belum selesai/);
    assert.doesNotMatch(result.error, /Invalid input|expected string/);
  }
  assert.equal(writes.length, 0);
  assert.equal(turnstileCalls.length, 0);
});

test("analytics skip demo invitations and keep recording real ones", async () => {
  for (const [invitation, expected] of [
    [{ is_demo: true }, 0],
    [{ is_demo: false }, 1],
    [null, 0],
  ]) {
    const { supabase, writes } = fakeSupabase(invitation);
    const { trackEvent } = loadTs("server/public/analytics.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => supabase },
    });
    await trackEvent({ invitationId, eventType: "cover_opened", sessionId: "s" });
    assert.equal(writes.length, expected);
  }
});

test("the public loader treats a demo invitation as not found", async () => {
  const row = { ...demoInvitation, status: "published", slug: "demo-terra", theme: { slug: "terra-botanica" } };
  const { supabase } = fakeSupabase(row);
  const loader = loadTs("server/public/invitation-loader.ts", {
    "next/cache": { unstable_cache: (fn) => fn },
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => supabase },
    "@/lib/utils/coupleName": { getCoupleDisplayName: () => "" },
    "./normalize": {
      loadNormalizedInvitation: async () => {
        throw new Error("a demo must not be normalized for /[slug]");
      },
    },
  });
  const result = await loader.getPublicInvitationBySlug("demo-terra");
  assert.equal(result.kind, "not_found");
});
