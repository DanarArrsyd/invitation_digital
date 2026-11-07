import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    Intl,
    encodeURIComponent,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const whatsapp = loadTs("lib/marketing/whatsapp.ts");
const price = loadTs("lib/marketing/price.ts");
const eventTypes = loadTs("lib/marketing/event-types.ts");

test("WhatsApp numbers are normalised to the wa.me form", () => {
  assert.equal(whatsapp.normalizeWhatsAppNumber("0812-3456-7890"), "6281234567890");
  assert.equal(whatsapp.normalizeWhatsAppNumber("+62 812 3456 7890"), "6281234567890");
  assert.equal(whatsapp.normalizeWhatsAppNumber("6281234567890"), "6281234567890");
  assert.equal(whatsapp.normalizeWhatsAppNumber("(021) 555-1234"), "62215551234");
  assert.equal(whatsapp.normalizeWhatsAppNumber("bukan nomor"), null);
  assert.equal(whatsapp.normalizeWhatsAppNumber("123"), null);
  assert.equal(whatsapp.normalizeWhatsAppNumber(""), null);
});

test("order messages fill placeholders and drop the ones without a value", () => {
  const template = "Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.";
  assert.equal(
    whatsapp.buildOrderMessage(template, { template: "Terra Botanica", paket: "Signature", acara: "Pernikahan" }),
    "Halo Temuraya, saya mau pesan template Terra Botanica paket Signature untuk Pernikahan.",
  );
  assert.equal(
    whatsapp.buildOrderMessage(template, { template: "Terra Botanica" }),
    "Halo Temuraya, saya mau pesan template Terra Botanica.",
  );
  assert.equal(whatsapp.buildOrderMessage(template, {}), "Halo Temuraya, saya mau pesan.");
  assert.equal(
    whatsapp.buildOrderMessage("Pesan {template} ({paket})", { template: "Cobalt", paket: "Grand" }),
    "Pesan Cobalt (Grand)",
  );
});

test("wa.me links encode the message", () => {
  assert.equal(
    whatsapp.buildWhatsAppUrl("6281234567890", "Halo & salam"),
    "https://wa.me/6281234567890?text=Halo%20%26%20salam",
  );
});

test("package prices format as rupiah or fall back to asking", () => {
  assert.equal(price.formatRupiah(149000), "Rp 149.000");
  assert.equal(price.formatRupiah(1250000), "Rp 1.250.000");
  assert.deepEqual(
    { ...price.describePackagePrice({ price_idr: 99000, price_note: " mulai dari " }) },
    { label: "Rp 99.000", note: "mulai dari", hasPrice: true },
  );
  assert.deepEqual(
    { ...price.describePackagePrice({ price_idr: null, price_note: "" }) },
    { label: "Tanya harga", note: null, hasPrice: false },
  );
  assert.equal(price.describePackagePrice(null).label, "Tanya harga");
  assert.equal(price.describePackagePrice({ price_idr: 0, price_note: null }).label, "Rp 0");
});

test("event types match the invitation type check and carry Indonesian labels", () => {
  assert.deepEqual(
    [...eventTypes.EVENT_TYPES].sort(),
    ["aqiqah", "birthday", "corporate", "engagement", "graduation", "wedding"],
  );
  assert.equal(eventTypes.EVENT_TYPE_LABELS.wedding, "Pernikahan");
  assert.equal(eventTypes.EVENT_TYPE_LABELS.engagement, "Lamaran");
  assert.equal(eventTypes.isEventType("aqiqah"), true);
  assert.equal(eventTypes.isEventType("party"), false);
});

test("invitation slugs cannot take a marketing route", () => {
  const timeZones = loadTs("lib/invitations/time-zones.ts");
  const validation = loadTs("lib/validation/invitation.ts", {
    zod: nodeRequire("zod"),
    "@/lib/invitations/time-zones": timeZones,
  });
  for (const slug of ["template", "demo", "admin", "paket", "Template"]) {
    const result = validation.invitationSlugSchema.safeParse(slug);
    assert.equal(result.success, false, `${slug} must be rejected`);
    assert.match(result.error.issues[0].message, /dipakai halaman Temuraya/);
  }
  assert.equal(validation.invitationSlugSchema.parse("rania-dimas"), "rania-dimas");
  assert.equal(validation.invitationSlugSchema.parse("template-kita"), "template-kita");
});

test("package highlights list only shipped features and follow each package", () => {
  const entitlements = loadTs("lib/packages/entitlements.ts");
  const { getPackageHighlights } = loadTs("lib/marketing/package-features.ts", {
    "@/lib/packages/entitlements": entitlements,
  });
  const intimate = getPackageHighlights("intimate");
  const signature = getPackageHighlights("signature");
  const grand = getPackageHighlights("grand");

  assert.equal(intimate[0], "Hingga 2 acara");
  assert.equal(intimate[1], "Hingga 8 foto galeri");
  assert.ok(!intimate.includes("Ucapan & doa tamu"));
  assert.ok(signature.includes("Ucapan & doa tamu"));
  assert.ok(!signature.includes("Link live streaming"));
  assert.ok(grand.includes("Link live streaming"));
  assert.ok(signature.includes("Tautan Instagram") && !intimate.includes("Tautan Instagram"));
  for (const unshipped of [/ekspor/i, /video/i, /statistik/i, /sponsor/i]) {
    assert.ok(!grand.some((item) => unshipped.test(item)), `${unshipped} is not shipped yet`);
  }
});

test("search engines skip the admin and demo pages", () => {
  const { default: robots } = loadTs("app/robots.ts", {
    "@/lib/marketing/site-url": { getSiteUrl: () => "https://temuraya.com" },
  });
  const rules = robots();
  assert.deepEqual([...rules.rules.disallow], ["/admin", "/demo"]);
  assert.equal(rules.sitemap, "https://temuraya.com/sitemap.xml");
});

test("media paths that start with / are app files and skip the storage bucket", () => {
  const storage = loadTs("lib/supabase/storage.ts", {
    "./env": { getSupabaseUrl: () => "https://project.supabase.co" },
  });
  assert.equal(storage.getMediaPublicUrl("/demo/terra-botanica/cover.jpg"), "/demo/terra-botanica/cover.jpg");
  assert.equal(
    storage.getMediaPublicUrl("invitations/abc/cover/x.jpg"),
    "https://project.supabase.co/storage/v1/object/public/invitation-media/invitations/abc/cover/x.jpg",
  );
  assert.equal(storage.getMediaPublicUrl(null), null);
});

test("WhatsApp messages carry the visit source only when there is one", () => {
  const template = "Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.";
  assert.equal(
    whatsapp.appendSourceAttribution("Halo Temuraya, saya mau pesan paket Signature.", { source: "instagram", campaign: "poster-uts" }),
    "Halo Temuraya, saya mau pesan paket Signature. (Sumber: instagram/poster-uts)",
  );
  assert.equal(whatsapp.appendSourceAttribution("Halo.", { source: "whatsapp", campaign: null }), "Halo. (Sumber: whatsapp)");
  assert.equal(whatsapp.appendSourceAttribution("Halo.", null), "Halo.");
  assert.equal(
    whatsapp.buildOrderWhatsAppUrl("6281234567890", template, { paket: "Signature" }),
    whatsapp.buildWhatsAppUrl("6281234567890", "Halo Temuraya, saya mau pesan paket Signature."),
  );
  assert.equal(
    whatsapp.buildOrderWhatsAppUrl("6281234567890", template, { paket: "Signature" }, { source: "instagram", campaign: "poster-uts" }),
    whatsapp.buildWhatsAppUrl("6281234567890", "Halo Temuraya, saya mau pesan paket Signature. (Sumber: instagram/poster-uts)"),
  );
});

test("UTM values are cleaned before they reach a message", () => {
  assert.equal(whatsapp.cleanSourceValue(" Instagram "), "instagram");
  assert.equal(whatsapp.cleanSourceValue("poster uts!"), "poster-uts");
  assert.equal(whatsapp.cleanSourceValue("Bayar ke rek. 123 <b>"), "bayar-ke-rek.-123-b");
  assert.equal(whatsapp.cleanSourceValue("!!!"), null);
  assert.equal(whatsapp.cleanSourceValue(""), null);
  assert.equal(whatsapp.cleanSourceValue(null), null);
  assert.equal(whatsapp.cleanSourceValue("a".repeat(100)).length, 60);
});

const serviceTerms = loadTs("lib/marketing/service-terms.ts");
const faq = loadTs("components/marketing/faq.ts", {
  "@/lib/marketing/event-types": eventTypes,
  "@/lib/marketing/service-terms": serviceTerms,
});
const ALL_TYPES = ["wedding", "engagement", "birthday", "aqiqah", "graduation", "corporate"];

test("the non-wedding FAQ answer follows the catalogue", () => {
  assert.equal(
    faq.describeNonWeddingTemplates([
      { name: "Nusantara Ivory", eventTypes: ["wedding"] },
      { name: "Janji Kota", eventTypes: ALL_TYPES },
      { name: "Benang Sriwijaya", eventTypes: ALL_TYPES },
    ]),
    "Ada. Template Janji Kota dan Benang Sriwijaya bisa dipakai untuk lamaran, ulang tahun, aqiqah, wisuda, dan acara kantor. Template lain khusus pernikahan. Tanyakan lewat WhatsApp untuk kebutuhan Anda.",
  );
  assert.equal(
    faq.describeNonWeddingTemplates([{ name: "Janji Kota", eventTypes: ALL_TYPES }]),
    "Ada. Template Janji Kota bisa dipakai untuk lamaran, ulang tahun, aqiqah, wisuda, dan acara kantor. Tanyakan lewat WhatsApp untuk kebutuhan Anda.",
  );
  assert.equal(
    faq.describeNonWeddingTemplates([
      { name: "A", eventTypes: ["wedding", "birthday"] },
      { name: "B", eventTypes: ["aqiqah", "graduation"] },
    ]),
    "Ada. Template A bisa dipakai untuk ulang tahun. Template B bisa dipakai untuk aqiqah dan wisuda. Tanyakan lewat WhatsApp untuk kebutuhan Anda.",
  );
  assert.match(faq.describeNonWeddingTemplates([{ name: "A", eventTypes: ["wedding"] }]), /sedang disiapkan/);
});

test("the FAQ states the order terms", () => {
  const items = faq.buildFaqItems([]);
  const terms = items.find((item) => item.question === "Berapa lama pengerjaannya?");
  assert.ok(terms);
  for (const fact of ["3 hari kerja", "data Anda kami terima lengkap", "revisi hingga 2 kali", "DP 50%", "pelunasan saat undangan terbit"]) {
    assert.ok(terms.answer.includes(fact), fact);
  }
});
