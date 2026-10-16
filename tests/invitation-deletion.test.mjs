import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/server/invitations/deletion.ts", import.meta.url), "utf8");

function loadDeletion(userClient, adminClient) {
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/supabase/server") return { createSupabaseServerClient: async () => userClient };
      if (name === "@/lib/supabase/admin") return { createSupabaseAdminClient: () => adminClient };
      if (name === "@/lib/supabase/storage") return { INVITATION_MEDIA_BUCKET: "invitation-media" };
      return nodeRequire(name);
    },
  });
  return exports;
}

function authorizedUserClient(job = { invitation_id: "invitation-1" }) {
  return {
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } }, error: null }) },
    from(table) {
      assert.equal(table, "invitation_deletion_jobs");
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: job, error: null }),
        order: async () => ({ data: job ? [job] : [], error: null }),
      };
    },
  };
}

function adminClient({ failFirstRemove = false } = {}) {
  const state = { removed: [], deletedJob: false, lastError: null, failFirstRemove };
  const files = {
    "invitations/invitation-1": [
      { name: "cover", id: null },
      { name: "gallery", id: null },
    ],
    "invitations/invitation-1/cover": [{ name: "cover.webp", id: "cover-id" }],
    "invitations/invitation-1/gallery": Array.from({ length: 101 }, (_, i) => ({
      name: `photo-${String(i).padStart(3, "0")}.webp`, id: `photo-${i}`,
    })),
  };
  const storage = {
    list: async (path, { limit, offset }) => ({ data: (files[path] ?? []).slice(offset, offset + limit), error: null }),
    remove: async (paths) => {
      if (state.failFirstRemove) {
        state.failFirstRemove = false;
        return { error: new Error("Storage unavailable") };
      }
      state.removed.push(...paths);
      return { error: null };
    },
  };
  return {
    state,
    storage: { from: (bucket) => { assert.equal(bucket, "invitation-media"); return storage; } },
    from: (table) => {
      assert.equal(table, "invitation_deletion_jobs");
      return {
        delete: () => ({ eq: async () => { state.deletedJob = true; return { error: null }; } }),
        update: (input) => ({ eq: async () => { state.lastError = input.last_error; return { error: null }; } }),
      };
    },
  };
}

test("deletion queues the exact confirmed slug through the authenticated RPC", async () => {
  let call;
  const user = authorizedUserClient();
  user.rpc = async (name, args) => {
    call = { name, args };
    return { data: "customer-slug", error: null };
  };
  const deletion = loadDeletion(user, adminClient());
  const result = await deletion.queueInvitationDeletion("invitation-1", "customer-slug");
  assert.equal(result.slug, "customer-slug");
  assert.equal(call.name, "queue_invitation_deletion");
  assert.equal(call.args.p_invitation_id, "invitation-1");
  assert.equal(call.args.p_confirmation_slug, "customer-slug");
});

test("cleanup lists nested media with pagination before removing the durable job", async () => {
  const admin = adminClient();
  const deletion = loadDeletion(authorizedUserClient(), admin);
  assert.equal(await deletion.cleanupDeletedInvitationMedia("invitation-1"), null);
  assert.equal(admin.state.removed.length, 102);
  assert.ok(admin.state.removed.includes("invitations/invitation-1/cover/cover.webp"));
  assert.ok(admin.state.removed.includes("invitations/invitation-1/gallery/photo-100.webp"));
  assert.equal(admin.state.deletedJob, true);
});

test("failed Storage removal leaves the job for an admin retry", async () => {
  const admin = adminClient({ failFirstRemove: true });
  const deletion = loadDeletion(authorizedUserClient(), admin);
  const result = await deletion.cleanupDeletedInvitationMedia("invitation-1");
  assert.match(result.error, /tertunda/);
  assert.equal(admin.state.deletedJob, false);
  assert.equal(admin.state.lastError, "Storage unavailable");
});
