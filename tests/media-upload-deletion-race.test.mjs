import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

import ts from "typescript";

const source = readFileSync(new URL("../src/server/media/upload.ts", import.meta.url), "utf8");

function loadCoverUpload({ missingAtLookup = false, missingAtUpdate = false } = {}) {
  const removed = [];
  const server = {
    storage: { from: () => ({ upload: async () => ({ error: null }) }) },
    from(table) {
      assert.equal(table, "invitations");
      return {
        select: () => ({ eq: () => ({ single: async () => ({
          data: missingAtLookup ? null : { cover_image_path: null },
          error: missingAtLookup ? { message: "Undangan tidak ditemukan." } : null,
        }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({
          data: missingAtUpdate ? null : { id: "invitation-1" }, error: null,
        }) }) }) }),
      };
    },
  };
  const admin = { storage: { from: () => ({ remove: async (paths) => {
    removed.push(...paths);
    return { error: null };
  } }) } };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    exports,
    require(name) {
      if (name === "node:crypto") return { randomUUID: () => "new-upload" };
      if (name === "@/lib/supabase/server") return { createSupabaseServerClient: async () => server };
      if (name === "@/lib/supabase/admin") return { createSupabaseAdminClient: () => admin };
      if (name === "@/lib/supabase/storage") return { INVITATION_MEDIA_BUCKET: "invitation-media" };
      if (name === "@/lib/validation/media") return { validateMediaFile: () => ({ ok: true }) };
      if (name === "@/lib/packages/entitlements") return { validatePackageCapacity: () => null };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { uploadCoverImage: exports.uploadCoverImage, removed };
}

for (const scenario of ["lookup", "update"]) {
  test(`cover upload removes its new file when invitation disappears during ${scenario}`, async () => {
    const { uploadCoverImage, removed } = loadCoverUpload({
      missingAtLookup: scenario === "lookup",
      missingAtUpdate: scenario === "update",
    });
    const result = await uploadCoverImage("invitation-1", { name: "cover.webp", type: "image/webp" });
    assert.match(result.error, /Undangan tidak ditemukan/);
    assert.deepEqual(removed, ["invitations/invitation-1/cover/new-upload.webp"]);
  });
}
