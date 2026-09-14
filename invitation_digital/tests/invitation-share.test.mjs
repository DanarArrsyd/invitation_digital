import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

import { getCoupleDisplayName } from "../src/lib/utils/coupleName.ts";

const nodeRequire = createRequire(import.meta.url);
const shareModuleUrl = new URL("../src/lib/share/invitation-share.ts", import.meta.url);

const invitation = {
  id: "invitation-1",
  type: "wedding",
  slug: "rayhana-febri",
  title: "The Wedding of Rayhana & Febri",
  status: "published",
  eventDate: "2026-10-20",
  venueSummary: "Puri Nirwaran Residence",
  publishedAt: "2026-09-01T00:00:00.000Z",
  expiresAt: null,
  theme: { slug: "nusantara-ivory", settings: {} },
  people: [
    { id: "bride", role: "bride", fullName: "Rayhana Putri Batavi", nickname: "Rayhana", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
    { id: "groom", role: "groom", fullName: "Febry Milady Kurnia", nickname: "Febri", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
  ],
  events: [],
  stories: [],
  gallery: [],
  gifts: [],
  wishes: [],
  content: { openingQuote: null, openingMessage: null, closingMessage: null },
  features: { story: false, gallery: true, livestream: false, rsvp: true, wishes: true, gift: true, guestPersonalization: true },
  media: { musicUrl: null, coverImageUrl: "https://images.example.test/cover.jpg" },
};

function transpile(url) {
  return ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
}

function loadShareModule() {
  try {
    const exports = {};
    vm.runInNewContext(transpile(shareModuleUrl), {
      exports,
      module: { exports },
      require(name) {
        if (name === "@/lib/utils/coupleName") return { getCoupleDisplayName };
        return nodeRequire(name);
      },
    });
    return exports;
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function loadPublicPage(loaderResult) {
  const exports = {};
  vm.runInNewContext(transpile(new URL("../src/app/(public)/[slug]/page.tsx", import.meta.url)), {
    exports,
    module: { exports },
    require(name) {
      if (name === "next/navigation") return { notFound() {} };
      if (name === "next/server") return { after() {} };
      if (name === "@/lib/analytics/session") return { getSessionId: async () => "session" };
      if (name === "@/lib/share/invitation-share") return loadShareModule();
      if (name === "@/server/public/invitation-loader") return { getPublicInvitationBySlug: async () => loaderResult };
      if (name === "@/server/public/analytics") return { trackEvent: async () => undefined };
      if (name.endsWith("/ExpiredState")) return { ExpiredState: () => null };
      if (name === "@/themes/ThemeRenderer") return { ThemeRenderer: () => null };
      return nodeRequire(name);
    },
  });
  return exports;
}

function loadOpenGraphImage(loaderResult) {
  try {
    const exports = {};
    vm.runInNewContext(transpile(new URL("../src/app/(public)/[slug]/opengraph-image.tsx", import.meta.url)), {
      exports,
      module: { exports },
      require(name) {
        if (name === "@/lib/share/invitation-share") return loadShareModule();
        if (name === "@/server/public/invitation-loader") return { getPublicInvitationBySlug: async () => loaderResult };
        return nodeRequire(name);
      },
    });
    return exports;
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

test("derives invitation-specific social copy and card data", () => {
  const share = loadShareModule();
  assert.equal(typeof share.getInvitationShareData, "function");

  const actual = JSON.parse(JSON.stringify(share.getInvitationShareData(invitation)));
  assert.deepEqual(actual, {
    displayName: "Rayhana & Febri",
    primaryName: "Rayhana",
    secondaryName: "Febri",
    title: "Undangan Pernikahan Rayhana & Febri",
    description: "Rayhana & Febri mengundang Anda pada 20 Oktober 2026 di Puri Nirwaran Residence.",
    dateLabel: "20 Oktober 2026",
    venueLabel: "Puri Nirwaran Residence",
    coverImageUrl: "https://images.example.test/cover.jpg",
  });
});

test("publishes Open Graph and large Twitter card metadata for each slug", async () => {
  const page = loadPublicPage({ kind: "ok", invitation, guest: null });
  assert.equal(typeof page.generateMetadata, "function");

  const metadata = await page.generateMetadata({ params: Promise.resolve({ slug: invitation.slug }) });
  assert.equal(metadata.title, "Undangan Pernikahan Rayhana & Febri");
  assert.equal(metadata.description, "Rayhana & Febri mengundang Anda pada 20 Oktober 2026 di Puri Nirwaran Residence.");
  assert.equal(metadata.openGraph.type, "website");
  assert.equal(metadata.openGraph.title, metadata.title);
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.equal(metadata.twitter.title, metadata.title);
});

test("renders a PNG social card from invitation data", async () => {
  const imageModule = loadOpenGraphImage({
    kind: "ok",
    invitation: { ...invitation, media: { ...invitation.media, coverImageUrl: null } },
    guest: null,
  });
  assert.equal(typeof imageModule.default, "function");

  const response = await imageModule.default({ params: Promise.resolve({ slug: invitation.slug }) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
  const png = await response.arrayBuffer();
  assert.ok(png.byteLength > 1_000);
});
