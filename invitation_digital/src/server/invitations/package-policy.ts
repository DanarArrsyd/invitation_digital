import {
  isPackageKey,
  type PackageKey,
} from "@/lib/packages/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InvitationFeatures } from "@/types/invitation";

export interface InvitationPackageUsage {
  packageKey: PackageKey;
  eventCount: number;
  galleryCount: number;
  enabledFeatures: Partial<InvitationFeatures>;
}

function getEnabledFeatures(settings: unknown): Partial<InvitationFeatures> {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return {};

  const features = (settings as { features?: unknown }).features;
  if (!features || typeof features !== "object" || Array.isArray(features)) return {};

  return Object.fromEntries(
    Object.entries(features).filter(([, value]) => typeof value === "boolean"),
  ) as Partial<InvitationFeatures>;
}

export async function getInvitationPackageUsage(
  invitationId: string,
): Promise<InvitationPackageUsage | { error: string }> {
  const supabase = await createSupabaseServerClient();

  const [invitationRes, eventsRes, galleryRes] = await Promise.all([
    supabase
      .from("invitations")
      .select("package_key, settings")
      .eq("id", invitationId)
      .maybeSingle(),
    supabase
      .from("invitation_events")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", invitationId),
    supabase
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", invitationId),
  ]);

  if (invitationRes.error) return { error: invitationRes.error.message };
  if (!invitationRes.data) return { error: "Undangan tidak ditemukan." };
  if (eventsRes.error) return { error: eventsRes.error.message };
  if (galleryRes.error) return { error: galleryRes.error.message };
  if (!isPackageKey(invitationRes.data.package_key)) {
    return { error: "Paket undangan tidak valid." };
  }

  return {
    packageKey: invitationRes.data.package_key,
    eventCount: eventsRes.count ?? 0,
    galleryCount: galleryRes.count ?? 0,
    enabledFeatures: getEnabledFeatures(invitationRes.data.settings),
  };
}

export async function updateInvitationPackage(input: {
  invitationId: string;
  packageKey: PackageKey;
}): Promise<{ error: string } | null> {
  // The invitation update and its database trigger share one transaction. The
  // trigger locks this row and reports all conflicts from the current snapshot.
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("invitations")
    .update({ package_key: input.packageKey })
    .eq("id", input.invitationId);

  return error ? { error: error.message } : null;
}
