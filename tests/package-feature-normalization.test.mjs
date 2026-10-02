import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadModule(path) {
  const source = ts.transpileModule(
    readFileSync(new URL(`../src/${path}.ts`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (name === "@/lib/packages/entitlements") return loadModule("lib/packages/entitlements");
      if (name === "@/lib/supabase/storage") return { getMediaPublicUrl: () => null };
      if (name === "@/lib/invitations/time-zones") return loadModule("lib/invitations/time-zones");
      throw new Error(`Unexpected normalization import: ${name}`);
    },
  });
  return exports;
}

const savedSettings = {
  features: {
    music: true, countdown: true, maps: true, story: true, gallery: true,
    dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
    guestPersonalization: true,
  },
  personSocials: { person: { instagram: "https://instagram.com/example" } },
  dressCode: { colors: ["ivory"], description: "Ivory" },
  music: { loop: false },
  gallery: { initialDisplayLimit: 5 },
  custom: { nested: [null, false, 0, "keep"] },
};

async function normalize(packageKey, settings = savedSettings) {
  const supabase = {
    from(table) {
      assert.ok([
        "invitation_people", "invitation_events", "invitation_stories",
        "gallery_items", "gift_accounts", "wishes",
      ].includes(table));
      const query = {
        select: () => query,
        eq: () => query,
        order: async () => ({ data: [], error: null }),
      };
      return query;
    },
  };
  const invitation = {
    id: "invitation-id", type: "wedding", slug: "test-invitation", title: "Test invitation",
    status: "published", package_key: packageKey, settings,
    theme_id: "theme-id", theme: { id: "theme-id", slug: "nusantara-ivory" },
    event_date: null, venue_summary: null, published_at: "2026-09-01T00:00:00Z",
    expires_at: null, created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z",
    created_by: null, opening_quote: null, opening_message: null, closing_message: null,
    music_path: null, cover_image_path: null,
  };
  const { loadNormalizedInvitation } = loadModule("server/public/normalize");
  return JSON.parse(JSON.stringify(await loadNormalizedInvitation(supabase, invitation)));
}

// Passing saved toggles straight through would expose paid sections after a
// downgrade; both feature views supplied to themes must enforce the package.
test("Intimate normalization disables stale gated toggles and keeps universal features", async () => {
  const result = await normalize("intimate");
  const expected = {
    music: true, countdown: true, maps: true, story: false, gallery: true,
    dressCode: false, livestream: false, rsvp: true, wishes: false, gift: true,
    guestPersonalization: true,
  };
  assert.deepEqual(result.features, expected);
  assert.deepEqual(result.theme.settings.features, expected);
});

// Merely disabling flags leaves Instagram and dress-code metadata available to
// themes. Strip those keys without deleting or altering the saved settings.
test("Intimate theme settings omit paid metadata and preserve unrelated settings", async () => {
  const before = JSON.parse(JSON.stringify(savedSettings));
  const result = await normalize("intimate");
  assert.equal(Object.hasOwn(result.theme.settings, "personSocials"), false);
  assert.equal(Object.hasOwn(result.theme.settings, "dressCode"), false);
  for (const key of ["music", "gallery", "custom"]) {
    assert.deepEqual(result.theme.settings[key], before[key]);
  }
  assert.deepEqual(savedSettings, before);
  assert.equal(Object.hasOwn(result, "packageKey"), false);
  assert.equal(Object.hasOwn(result, "package_key"), false);
  assert.equal(Object.hasOwn(result.theme, "packageKey"), false);
  assert.equal(Object.hasOwn(result.theme.settings, "packageKey"), false);
});

test("Signature keeps story, wishes and paid metadata but disables livestream", async () => {
  const result = await normalize("signature");
  assert.equal(result.features.story, true);
  assert.equal(result.features.wishes, true);
  assert.equal(result.features.dressCode, true);
  assert.equal(result.features.livestream, false);
  assert.equal(result.theme.settings.features.livestream, false);
  assert.deepEqual(result.theme.settings.personSocials, savedSettings.personSocials);
  assert.deepEqual(result.theme.settings.dressCode, savedSettings.dressCode);
});

test("Grand preserves all saved features and theme settings", async () => {
  const result = await normalize("grand");
  assert.deepEqual(result.features, savedSettings.features);
  assert.deepEqual(result.theme.settings, savedSettings);
});

test("missing settings default to disabled features and saved false values remain off", async () => {
  for (const packageKey of ["intimate", "signature", "grand"]) {
    const empty = await normalize(packageKey, null);
    assert.equal(Object.values(empty.features).every((enabled) => enabled === false), true);
    const disabled = await normalize(packageKey, { features: { music: false, story: false } });
    assert.equal(disabled.features.music, false);
    assert.equal(disabled.features.story, false);
  }
});
