import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);

function loadEntitlements() {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/lib/packages/entitlements.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}

function loadCreateInvitationAction() {
  const validationSource = ts.transpileModule(
    readFileSync(new URL("../src/lib/validation/invitation.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const validationExports = {};
  vm.runInNewContext(validationSource, {
    exports: validationExports,
    module: { exports: validationExports },
    require(name) {
      if (name === "zod") return nodeRequire("zod");
      throw new Error(`Unexpected validation import: ${name}`);
    },
  });

  const actionSource = ts.transpileModule(
    readFileSync(
      new URL("../src/app/admin/(protected)/invitations/new/actions.ts", import.meta.url),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const actionExports = {};
  vm.runInNewContext(actionSource, {
    exports: actionExports,
    module: { exports: actionExports },
    require(name) {
      if (name === "next/navigation") {
        return { redirect: () => { throw new Error("Unexpected redirect"); } };
      }
      if (name === "@/lib/validation/invitation") return validationExports;
      if (name === "@/server/invitations/mutations") {
        return {
          createInvitation: async () => {
            throw new Error("Invalid package key reached the invitation mutation");
          },
        };
      }
      throw new Error(`Unexpected action import: ${name}`);
    },
  });
  return actionExports.createInvitationAction;
}

test("defines stable package limits and ordering", () => {
  const { PACKAGE_KEYS, PACKAGE_DEFINITIONS, isPackageUpgrade, isPackageDowngrade } =
    loadEntitlements();
  assert.deepEqual(Array.from(PACKAGE_KEYS), ["intimate", "signature", "grand"]);
  assert.equal(PACKAGE_DEFINITIONS.intimate.limits.maxEvents, 2);
  assert.equal(PACKAGE_DEFINITIONS.signature.limits.maxGalleryImages, 20);
  assert.equal(PACKAGE_DEFINITIONS.grand.limits.maxSponsors, 10);
  assert.equal(isPackageUpgrade("intimate", "signature"), true);
  assert.equal(isPackageDowngrade("grand", "signature"), true);
  assert.equal(isPackageUpgrade("signature", "signature"), false);
});

test("defines the complete package entitlement matrix", () => {
  const { PACKAGE_DEFINITIONS, getDefaultInvitationFeatures } = loadEntitlements();
  const expected = {
    intimate: {
      label: "Intimate",
      recommended: false,
      limits: { maxEvents: 2, maxGalleryImages: 8, maxSponsors: 0 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: false,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: false,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: false,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: false,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: false,
        rsvpExport: false,
        sponsorship: false,
        videoGallery: false,
        advancedRsvp: false,
        analytics: false,
        stylePresets: false,
      },
    },
    signature: {
      label: "Signature",
      recommended: true,
      limits: { maxEvents: 3, maxGalleryImages: 20, maxSponsors: 5 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: true,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: true,
        rsvpExport: true,
        sponsorship: true,
        videoGallery: false,
        advancedRsvp: false,
        analytics: false,
        stylePresets: false,
      },
    },
    grand: {
      label: "Grand",
      recommended: false,
      limits: { maxEvents: 5, maxGalleryImages: 40, maxSponsors: 10 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: true,
        livestream: true,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: true,
        rsvpExport: true,
        sponsorship: true,
        videoGallery: true,
        advancedRsvp: true,
        analytics: true,
        stylePresets: true,
      },
    },
  };

  for (const [packageKey, packageExpectation] of Object.entries(expected)) {
    const definition = PACKAGE_DEFINITIONS[packageKey];
    assert.equal(definition.label, packageExpectation.label);
    assert.equal(definition.recommended, packageExpectation.recommended);
    assert.deepEqual(JSON.parse(JSON.stringify(definition.limits)), packageExpectation.limits);
    assert.deepEqual(
      JSON.parse(JSON.stringify(definition.invitationFeatures)),
      packageExpectation.invitationFeatures,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(getDefaultInvitationFeatures(packageKey))),
      packageExpectation.defaults,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(definition.capabilities)),
      packageExpectation.capabilities,
    );
  }
});

test("intersects saved invitation features with package entitlements", () => {
  const { resolveEffectiveInvitationFeatures } = loadEntitlements();
  const requested = {
    music: true, countdown: true, maps: true, story: true, gallery: true,
    dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
    guestPersonalization: true,
  };
  const intimate = resolveEffectiveInvitationFeatures("intimate", requested);
  assert.equal(intimate.music, true);
  assert.equal(intimate.story, false);
  assert.equal(intimate.wishes, false);
  assert.equal(intimate.livestream, false);
  const grand = resolveEffectiveInvitationFeatures("grand", requested);
  assert.equal(grand.story, true);
  assert.equal(grand.livestream, true);
});

test("uses product defaults without enabling optional dress code or livestream", () => {
  const { getDefaultInvitationFeatures } = loadEntitlements();
  const intimate = getDefaultInvitationFeatures("intimate");
  assert.equal(intimate.music, true);
  assert.equal(intimate.story, false);
  assert.equal(intimate.wishes, false);
  assert.equal(intimate.dressCode, false);
  assert.equal(intimate.livestream, false);

  const signature = getDefaultInvitationFeatures("signature");
  assert.equal(signature.story, true);
  assert.equal(signature.wishes, true);
  assert.equal(signature.dressCode, false);
  assert.equal(signature.livestream, false);
});

test("identifies package keys and required packages", () => {
  const { isPackageKey, getRequiredPackageForFeature } = loadEntitlements();
  assert.equal(isPackageKey("signature"), true);
  assert.equal(isPackageKey("premium"), false);
  assert.equal(getRequiredPackageForFeature("story"), "signature");
  assert.equal(getRequiredPackageForFeature("wishes"), "signature");
  assert.equal(getRequiredPackageForFeature("livestream"), "grand");
  assert.equal(getRequiredPackageForFeature("music"), "intimate");
  assert.equal(getRequiredPackageForFeature("instagram"), "signature");
  assert.equal(getRequiredPackageForFeature("videoGallery"), "grand");
});

test("rejects additions beyond event and gallery limits", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 1, 1), null);
  assert.equal(
    validatePackageCapacity("intimate", "events", 2, 1).code,
    "PACKAGE_EVENT_LIMIT_REACHED",
  );
  assert.equal(
    validatePackageCapacity("signature", "gallery", 19, 2).code,
    "PACKAGE_GALLERY_LIMIT_REACHED",
  );
});

test("allows event edits conceptually without consuming capacity", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 2, 0), null);
  assert.equal(validatePackageCapacity("intimate", "events", 2, 1).limit, 2);
  assert.equal(validatePackageCapacity("grand", "events", 4, 1), null);
});

test("reports every incompatible downgrade condition", () => {
  const { findPackageChangeConflicts } = loadEntitlements();
  const conflicts = findPackageChangeConflicts("intimate", {
    eventCount: 3,
    galleryCount: 9,
    enabledFeatures: { story: true, wishes: true },
  });
  assert.deepEqual(
    Array.from(conflicts, (item) => item.kind),
    ["events", "gallery", "feature", "feature"],
  );
});

test("allows package capacity at the limit and leaves compatible changes conflict-free", () => {
  const { validatePackageCapacity, findPackageChangeConflicts } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 2, 0), null);
  assert.equal(validatePackageCapacity("intimate", "gallery", 6, 2), null);
  assert.equal(validatePackageCapacity("grand", "events", 4, 1), null);
  assert.deepEqual(
    Array.from(findPackageChangeConflicts("signature", {
      eventCount: 3,
      galleryCount: 20,
      enabledFeatures: { story: true, wishes: true, dressCode: true },
    })),
    [],
  );
});

test("reports stable Indonesian capacity errors without mutating conflict snapshots", () => {
  const { validatePackageCapacity, findPackageChangeConflicts } = loadEntitlements();
  const error = validatePackageCapacity("intimate", "events", 2, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(error)), {
    code: "PACKAGE_EVENT_LIMIT_REACHED",
    message: "Paket Intimate mendukung maksimal 2 acara.",
    packageKey: "intimate",
    current: 2,
    limit: 2,
  });

  const snapshot = {
    eventCount: 3,
    galleryCount: 9,
    enabledFeatures: { story: true, wishes: true },
  };
  const before = JSON.parse(JSON.stringify(snapshot));
  findPackageChangeConflicts("intimate", snapshot);
  assert.deepEqual(snapshot, before);
});

test("rejects invalid package keys in the invitation creation server action", async () => {
  const createInvitationAction = loadCreateInvitationAction();
  const formData = new FormData();
  formData.set("title", "Rayhana & Febri");
  formData.set("slug", "rayhana-febri");
  formData.set("type", "wedding");
  formData.set("themeId", "d290f1ee-6c54-4b01-90e6-d701748f0851");
  formData.set("packageKey", "premium");

  const result = await createInvitationAction({ error: null }, formData);

  assert.equal(typeof result.error, "string");
});
