import "server-only";

import { randomUUID } from "node:crypto";

import type { EventType } from "@/lib/marketing/event-types";
import type { PackageKey } from "@/lib/packages/entitlements";
import { INVITATION_MEDIA_BUCKET } from "@/lib/supabase/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateMediaFile } from "@/lib/validation/media";

type Result = { error: string } | null;

export async function updatePackageOffer(input: {
  packageKey: PackageKey;
  price: number | null;
  priceNote: string | null;
  isVisible: boolean;
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("package_offers").upsert({
    package_key: input.packageKey,
    price_idr: input.price,
    price_note: input.priceNote,
    is_visible: input.isVisible,
  });
  return error ? { error: error.message } : null;
}

export async function updateSiteContact(input: {
  whatsappNumber: string | null;
  whatsappMessage: string;
  instagramUrl: string | null;
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: true,
    whatsapp_number: input.whatsappNumber,
    whatsapp_message: input.whatsappMessage,
    instagram_url: input.instagramUrl,
  });
  return error ? { error: error.message } : null;
}

export async function updateThemeCatalogue(input: {
  themeId: string;
  isListed: boolean;
  sortOrder: number;
  tagline: string | null;
  description: string | null;
  eventTypes: EventType[];
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("themes")
    .update({
      is_listed: input.isListed,
      sort_order: input.sortOrder,
      tagline: input.tagline,
      description: input.description,
      event_types: input.eventTypes,
    })
    .eq("id", input.themeId);
  return error ? { error: error.message } : null;
}

/**
 * Makes `invitationId` the only demo of the theme, or clears the theme's demo
 * when it is null. The unique index allows one demo per theme, so the old
 * demo is cleared first. Returns the slugs whose public pages must refresh.
 */
export async function setThemeDemo(input: {
  themeId: string;
  invitationId: string | null;
}): Promise<{ error: string } | { changedSlugs: string[] }> {
  const supabase = await createSupabaseServerClient();

  if (input.invitationId) {
    const { data: candidate, error } = await supabase
      .from("invitations")
      .select("id, theme_id")
      .eq("id", input.invitationId)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!candidate || candidate.theme_id !== input.themeId) {
      return { error: "Undangan demo harus memakai template yang sama." };
    }
  }

  const { data: cleared, error: clearError } = await supabase
    .from("invitations")
    .update({ is_demo: false })
    .eq("theme_id", input.themeId)
    .eq("is_demo", true)
    .select("slug");
  if (clearError) return { error: clearError.message };

  const changedSlugs = cleared.map((row) => row.slug);
  if (input.invitationId) {
    const { data: marked, error } = await supabase
      .from("invitations")
      .update({ is_demo: true })
      .eq("id", input.invitationId)
      .select("slug")
      .single();
    if (error) return { error: error.message };
    changedSlugs.push(marked.slug);
  }
  return { changedSlugs };
}

export async function addThemeScreenshots(themeId: string, files: File[]): Promise<Result> {
  if (files.length === 0) return { error: "Pilih minimal satu gambar." };
  for (const file of files) {
    const validation = validateMediaFile(file, "gallery");
    if (!validation.ok) return { error: `${file.name}: ${validation.error}` };
  }

  const supabase = await createSupabaseServerClient();
  const { data: theme, error } = await supabase
    .from("themes")
    .select("screenshot_paths")
    .eq("id", themeId)
    .single();
  if (error) return { error: error.message };

  const uploaded: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || file.type.split("/").pop() || "img";
    const path = `themes/${themeId}/screenshots/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(INVITATION_MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      if (uploaded.length) await supabase.storage.from(INVITATION_MEDIA_BUCKET).remove(uploaded);
      return { error: uploadError.message };
    }
    uploaded.push(path);
  }

  const { error: updateError } = await supabase
    .from("themes")
    .update({ screenshot_paths: [...theme.screenshot_paths, ...uploaded] })
    .eq("id", themeId);
  if (updateError) {
    await supabase.storage.from(INVITATION_MEDIA_BUCKET).remove(uploaded);
    return { error: updateError.message };
  }
  return null;
}

async function rewriteScreenshots(
  themeId: string,
  rewrite: (paths: string[]) => string[],
): Promise<{ error: string } | { before: string[]; after: string[] }> {
  const supabase = await createSupabaseServerClient();
  const { data: theme, error } = await supabase
    .from("themes")
    .select("screenshot_paths")
    .eq("id", themeId)
    .single();
  if (error) return { error: error.message };

  const after = rewrite(theme.screenshot_paths);
  const { error: updateError } = await supabase
    .from("themes")
    .update({ screenshot_paths: after })
    .eq("id", themeId);
  return updateError ? { error: updateError.message } : { before: theme.screenshot_paths, after };
}

export async function removeThemeScreenshot(themeId: string, path: string): Promise<Result> {
  const result = await rewriteScreenshots(themeId, (paths) => paths.filter((item) => item !== path));
  if ("error" in result) return result;
  if (result.before.includes(path)) {
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from(INVITATION_MEDIA_BUCKET).remove([path]);
  }
  return null;
}

/** The first screenshot is the template's cover on cards and mockups. */
export async function makeThemeScreenshotCover(themeId: string, path: string): Promise<Result> {
  const result = await rewriteScreenshots(themeId, (paths) =>
    paths.includes(path) ? [path, ...paths.filter((item) => item !== path)] : paths,
  );
  return "error" in result ? result : null;
}
