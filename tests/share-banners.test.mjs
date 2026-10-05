import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadTs(path, dependencies = {}) {
  const output = ts.transpileModule(source(`src/${path}`), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    module: { exports },
    Intl,
    URL,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const styles = loadTs("lib/og/share-styles.ts");

test("every registered theme has its own share banner style", () => {
  const registry = source("src/themes/registry.ts");
  const slugs = [...registry.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\{\s*\n\s*component:/gm)].map((match) => match[1]);
  assert.ok(slugs.length >= 4, "registry slugs were found");
  for (const slug of slugs) {
    assert.ok(styles.THEME_SHARE_STYLES[slug], `${slug} needs an entry in src/lib/og/share-styles.ts`);
    assert.notEqual(styles.getShareStyle(slug), styles.BRAND_SHARE_STYLE, slug);
  }
});

test("unknown or future themes still get the Temuraya banner", () => {
  assert.equal(styles.getShareStyle("tema-baru"), styles.BRAND_SHARE_STYLE);
  assert.equal(styles.getShareStyle(null), styles.BRAND_SHARE_STYLE);
});

test("each share script face ships as a static font file", () => {
  const assets = source("src/lib/og/assets.ts");
  const files = [...assets.matchAll(/"([a-z0-9-]+\.woff)"/g)].map((match) => match[1]);
  assert.ok(files.length >= 7);
  for (const file of files) assert.ok(existsSync(new URL(`../assets/og-fonts/${file}`, import.meta.url)), file);
  for (const script of new Set(Object.values(styles.THEME_SHARE_STYLES).map((style) => style.script))) {
    assert.match(assets, new RegExp(`"?${script}"?: \\{ file:`), script);
  }
  assert.match(source("next.config.ts"), /outputFileTracingIncludes[\s\S]*assets\/og-fonts/);
});

test("invitation links, templates, demos and the catalogue each render a banner", () => {
  for (const route of [
    "src/app/(public)/[slug]/opengraph-image.tsx",
    "src/app/(marketing)/template/opengraph-image.tsx",
    "src/app/(marketing)/template/[themeSlug]/opengraph-image.tsx",
    "src/app/demo/[themeSlug]/opengraph-image.tsx",
  ]) {
    const text = source(route);
    assert.match(text, /export const size = OG_SIZE/, route);
    assert.match(text, /export default async function/, route);
  }
  assert.ok(existsSync(new URL("../src/app/opengraph-image.png", import.meta.url)), "site-wide banner");
  assert.doesNotMatch(
    source("src/app/(marketing)/template/[themeSlug]/page.tsx"),
    /images:\s*\[\{ url: template\.coverUrl/,
    "the template page no longer shares a cropped phone screenshot",
  );
});

test("invitation share copy names the event type", () => {
  const share = loadTs("lib/share/invitation-share.ts", {
    "@/lib/marketing/event-types": loadTs("lib/marketing/event-types.ts"),
    "@/lib/utils/coupleName": { getCoupleDisplayName: (_people, title) => title },
  });
  assert.equal(share.getInvitationEyebrow("wedding"), "Undangan Pernikahan");
  assert.equal(share.getInvitationEyebrow("aqiqah"), "Undangan Aqiqah");
  assert.equal(share.getInvitationEyebrow(undefined), "Undangan Pernikahan");
  const data = share.getInvitationShareData({
    type: "aqiqah",
    title: "Aqiqah Ananda Raka",
    eventDate: null,
    venueSummary: null,
    people: [],
    media: { coverImageUrl: null },
  });
  assert.equal(data.title, "Undangan Aqiqah Ananda Raka");
  const birthday = share.getInvitationShareData({ ...data, type: "birthday", title: "Raka ke-5", people: [], media: { coverImageUrl: null } });
  assert.equal(birthday.title, "Undangan Ulang tahun Raka ke-5");
});
