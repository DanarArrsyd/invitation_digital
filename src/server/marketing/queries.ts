import "server-only";

import { unstable_cache } from "next/cache";

import { demoInvitationCacheTag, MARKETING_TAGS } from "@/lib/marketing/cache-tags";
import { isEventType, type EventType } from "@/lib/marketing/event-types";
import { PACKAGE_DEFINITIONS, PACKAGE_KEYS, type PackageKey } from "@/lib/packages/entitlements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { loadNormalizedInvitation } from "@/server/public/normalize";
import type { Json } from "@/types/database";
import type { InvitationFeatures, PublicInvitation } from "@/types/invitation";

const REVALIDATE_SECONDS = 600;

export interface SiteSettings {
  whatsappNumber: string | null;
  whatsappMessage: string;
  instagramUrl: string | null;
}

export interface PackageOffer {
  packageKey: PackageKey;
  priceIdr: number | null;
  priceNote: string | null;
  isVisible: boolean;
}

export interface MarketingTemplate {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  eventTypes: EventType[];
  /** First screenshot, or the theme preview image; null until the admin uploads one. */
  coverUrl: string | null;
  screenshotUrls: string[];
  hasDemo: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: null,
  whatsappMessage: "Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.",
  instagramUrl: null,
};

async function loadSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return DEFAULT_SETTINGS;
  return {
    whatsappNumber: data.whatsapp_number,
    whatsappMessage: data.whatsapp_message,
    instagramUrl: data.instagram_url,
  };
}

async function loadPackageOffers(): Promise<PackageOffer[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("package_offers").select("*");
  if (error) throw new Error(error.message);
  // Always the three packages in entitlement order, even if a row is missing.
  return PACKAGE_KEYS.map((packageKey) => {
    const row = data.find((offer) => offer.package_key === packageKey);
    return {
      packageKey,
      priceIdr: row?.price_idr ?? null,
      priceNote: row?.price_note ?? null,
      isVisible: row?.is_visible ?? true,
    };
  });
}

async function loadListedTemplates(): Promise<MarketingTemplate[]> {
  const supabase = createSupabaseAdminClient();
  const [themesRes, demosRes] = await Promise.all([
    supabase
      .from("themes")
      .select("id, slug, name, tagline, description, event_types, screenshot_paths, preview_image_path")
      .eq("is_listed", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("invitations").select("theme_id").eq("is_demo", true),
  ]);
  if (themesRes.error) throw new Error(themesRes.error.message);
  if (demosRes.error) throw new Error(demosRes.error.message);

  const themesWithDemo = new Set(demosRes.data.map((row) => row.theme_id));
  return themesRes.data.map((theme) => {
    const screenshotUrls = theme.screenshot_paths
      .map((path) => getMediaPublicUrl(path))
      .filter((url): url is string => url !== null);
    return {
      id: theme.id,
      slug: theme.slug,
      name: theme.name,
      tagline: theme.tagline,
      description: theme.description,
      eventTypes: theme.event_types.filter(isEventType),
      coverUrl: screenshotUrls[0] ?? getMediaPublicUrl(theme.preview_image_path),
      screenshotUrls,
      hasDemo: themesWithDemo.has(theme.id),
    };
  });
}

export const getSiteSettings = unstable_cache(loadSiteSettings, ["marketing-settings"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [MARKETING_TAGS.settings],
});

export const getPackageOffers = unstable_cache(loadPackageOffers, ["marketing-packages"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [MARKETING_TAGS.packages],
});

export const getListedTemplates = unstable_cache(loadListedTemplates, ["marketing-catalogue"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [MARKETING_TAGS.catalogue],
});

export async function getListedTemplate(slug: string): Promise<MarketingTemplate | null> {
  const templates = await getListedTemplates();
  return templates.find((template) => template.slug === slug) ?? null;
}

/** Every feature on: the package then narrows it to what it includes. */
const ALL_FEATURES: InvitationFeatures = {
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
};

async function loadDemoInvitation(themeSlug: string, packageKey: PackageKey): Promise<PublicInvitation | null> {
  const supabase = createSupabaseAdminClient();
  const { data: theme, error: themeError } = await supabase
    .from("themes")
    .select("*")
    .eq("slug", themeSlug)
    .eq("is_listed", true)
    .maybeSingle();
  if (themeError) throw new Error(themeError.message);
  if (!theme) return null;

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("theme_id", theme.id)
    .eq("is_demo", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!invitation) return null;

  // Render the demo as the requested package would see it: every section the
  // package includes is on, and its event and gallery limits apply.
  const settings = { ...((invitation.settings ?? {}) as Record<string, Json>), features: { ...ALL_FEATURES } };
  const normalized = await loadNormalizedInvitation(supabase, {
    ...invitation,
    package_key: packageKey,
    settings,
    expires_at: null,
    theme,
  });
  const limits = PACKAGE_DEFINITIONS[packageKey].limits;
  return {
    ...normalized,
    expiresAt: null,
    events: normalized.events.slice(0, limits.maxEvents),
    gallery: normalized.gallery.slice(0, limits.maxGalleryImages),
  };
}

export function getDemoInvitation(themeSlug: string, packageKey: PackageKey): Promise<PublicInvitation | null> {
  return unstable_cache(
    () => loadDemoInvitation(themeSlug, packageKey),
    ["marketing-demo", themeSlug, packageKey],
    { revalidate: REVALIDATE_SECONDS, tags: [demoInvitationCacheTag(themeSlug), MARKETING_TAGS.catalogue] },
  )();
}
