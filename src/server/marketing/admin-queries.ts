import "server-only";

import { PACKAGE_KEYS, type PackageKey } from "@/lib/packages/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/** Uncached reads for the admin "Situs" pages, so a save shows immediately. */

export async function getAdminPackageOffers(): Promise<Record<PackageKey, Tables<"package_offers"> | null>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("package_offers").select("*");
  if (error) throw new Error(error.message);
  return Object.fromEntries(
    PACKAGE_KEYS.map((key) => [key, data.find((row) => row.package_key === key) ?? null]),
  ) as Record<PackageKey, Tables<"package_offers"> | null>;
}

export async function getAdminSiteSettings(): Promise<Tables<"site_settings"> | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export interface AdminCatalogueTheme {
  theme: Tables<"themes">;
  invitations: Pick<Tables<"invitations">, "id" | "title" | "slug" | "status" | "is_demo">[];
}

export async function getAdminCatalogue(): Promise<AdminCatalogueTheme[]> {
  const supabase = await createSupabaseServerClient();
  const [themesRes, invitationsRes] = await Promise.all([
    supabase.from("themes").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    supabase
      .from("invitations")
      .select("id, title, slug, status, is_demo, theme_id")
      .order("updated_at", { ascending: false }),
  ]);
  if (themesRes.error) throw new Error(themesRes.error.message);
  if (invitationsRes.error) throw new Error(invitationsRes.error.message);

  return themesRes.data.map((theme) => ({
    theme,
    invitations: invitationsRes.data
      .filter((invitation) => invitation.theme_id === theme.id)
      .map(({ id, title, slug, status, is_demo }) => ({ id, title, slug, status, is_demo })),
  }));
}
