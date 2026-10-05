"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { demoInvitationCacheTag, MARKETING_TAGS } from "@/lib/marketing/cache-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  packageOfferSchema,
  siteContactSchema,
  themeCatalogueSchema,
  themeDemoSchema,
  themeScreenshotSchema,
} from "@/lib/validation/site";
import {
  addThemeScreenshots,
  makeThemeScreenshotCover,
  removeThemeScreenshot,
  setThemeDemo,
  updatePackageOffer,
  updateSiteContact,
  updateThemeCatalogue,
} from "@/server/marketing/mutations";

type SitePage = "packages" | "contact" | "catalog";

function back(page: SitePage, outcome: { ok: string } | { error: string }, hash = ""): never {
  const query = "ok" in outcome ? `ok=${encodeURIComponent(outcome.ok)}` : `error=${encodeURIComponent(outcome.error)}`;
  redirect(`/admin/site/${page}?${query}${hash}`);
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** The marketing pages read through cached loaders; drop them after a save. */
function refreshMarketing(...tags: string[]) {
  for (const tag of tags) updateTag(tag);
  revalidatePath("/", "layout");
}

export async function updatePackageOfferAction(formData: FormData) {
  const parsed = packageOfferSchema.safeParse({
    packageKey: text(formData, "packageKey"),
    price: text(formData, "price"),
    priceNote: text(formData, "priceNote"),
    isVisible: formData.get("isVisible") === "on",
  });
  if (!parsed.success) back("packages", { error: parsed.error.issues[0]?.message ?? "Input tidak valid" });

  const result = await updatePackageOffer(parsed.data);
  if (result) back("packages", result);

  refreshMarketing(MARKETING_TAGS.packages);
  back("packages", { ok: "Harga paket tersimpan." });
}

export async function updateSiteContactAction(formData: FormData) {
  const parsed = siteContactSchema.safeParse({
    whatsappNumber: text(formData, "whatsappNumber"),
    whatsappMessage: text(formData, "whatsappMessage"),
    instagramUrl: text(formData, "instagramUrl"),
  });
  if (!parsed.success) back("contact", { error: parsed.error.issues[0]?.message ?? "Input tidak valid" });

  const result = await updateSiteContact(parsed.data);
  if (result) back("contact", result);

  refreshMarketing(MARKETING_TAGS.settings);
  back("contact", { ok: "Kontak tersimpan." });
}

export async function updateThemeCatalogueAction(formData: FormData) {
  const themeId = text(formData, "themeId");
  const parsed = themeCatalogueSchema.safeParse({
    themeId,
    isListed: formData.get("isListed") === "on",
    sortOrder: text(formData, "sortOrder") || "0",
    tagline: text(formData, "tagline"),
    description: text(formData, "description"),
    eventTypes: formData.getAll("eventTypes"),
  });
  if (!parsed.success) back("catalog", { error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, `#theme-${themeId}`);

  const result = await updateThemeCatalogue(parsed.data);
  if (result) back("catalog", result, `#theme-${themeId}`);

  refreshMarketing(MARKETING_TAGS.catalogue);
  back("catalog", { ok: "Template tersimpan." }, `#theme-${themeId}`);
}

export async function setThemeDemoAction(formData: FormData) {
  const themeId = text(formData, "themeId");
  const parsed = themeDemoSchema.safeParse({ themeId, invitationId: text(formData, "invitationId") });
  if (!parsed.success) back("catalog", { error: "Pilihan demo tidak valid." }, `#theme-${themeId}`);

  const result = await setThemeDemo({ themeId, invitationId: parsed.data.invitationId || null });
  if ("error" in result) back("catalog", result, `#theme-${themeId}`);

  // The old and new demo leave / disappear from their public /[slug] pages.
  for (const slug of result.changedSlugs) revalidatePath(`/${slug}`);
  revalidatePath("/admin/invitations", "page");
  revalidatePath("/admin/dashboard", "page");

  const supabase = await createSupabaseServerClient();
  const { data: theme } = await supabase.from("themes").select("slug").eq("id", themeId).maybeSingle();
  refreshMarketing(MARKETING_TAGS.catalogue, ...(theme ? [demoInvitationCacheTag(theme.slug)] : []));
  back(
    "catalog",
    { ok: parsed.data.invitationId ? "Undangan demo dipasang." : "Demo dilepas dari template." },
    `#theme-${themeId}`,
  );
}

export async function addThemeScreenshotsAction(formData: FormData) {
  const themeId = text(formData, "themeId");
  const files = formData.getAll("screenshots").filter((value): value is File => value instanceof File && value.size > 0);
  const result = await addThemeScreenshots(themeId, files);
  if (result) back("catalog", result, `#theme-${themeId}`);

  refreshMarketing(MARKETING_TAGS.catalogue);
  back("catalog", { ok: "Screenshot ditambahkan." }, `#theme-${themeId}`);
}

export async function removeThemeScreenshotAction(formData: FormData) {
  const parsed = themeScreenshotSchema.safeParse({ themeId: text(formData, "themeId"), path: text(formData, "path") });
  if (!parsed.success) back("catalog", { error: "Screenshot tidak valid." });

  const result = await removeThemeScreenshot(parsed.data.themeId, parsed.data.path);
  if (result) back("catalog", result, `#theme-${parsed.data.themeId}`);

  refreshMarketing(MARKETING_TAGS.catalogue);
  back("catalog", { ok: "Screenshot dihapus." }, `#theme-${parsed.data.themeId}`);
}

export async function makeThemeScreenshotCoverAction(formData: FormData) {
  const parsed = themeScreenshotSchema.safeParse({ themeId: text(formData, "themeId"), path: text(formData, "path") });
  if (!parsed.success) back("catalog", { error: "Screenshot tidak valid." });

  const result = await makeThemeScreenshotCover(parsed.data.themeId, parsed.data.path);
  if (result) back("catalog", result, `#theme-${parsed.data.themeId}`);

  refreshMarketing(MARKETING_TAGS.catalogue);
  back("catalog", { ok: "Cover template diganti." }, `#theme-${parsed.data.themeId}`);
}
