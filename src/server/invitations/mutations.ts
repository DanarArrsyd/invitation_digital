import { randomUUID } from "node:crypto";

import {
  getDefaultInvitationFeatures,
  getRequiredPackageForFeature,
  PACKAGE_DEFINITIONS,
  resolveEffectiveInvitationFeatures,
  validatePackageCapacity,
  type PackageKey,
} from "@/lib/packages/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { InvitationFeatures } from "@/types/invitation";

function defaultSettings(packageKey: PackageKey): Json {
  return {
    features: { ...getDefaultInvitationFeatures(packageKey) },
    music: { autoplayAfterOpen: true, loop: true },
    gallery: { initialDisplayLimit: 8 },
    expiration: { monthsAfterPublish: 3 },
  } satisfies Record<string, Json>;
}

export async function createInvitation(input: {
  title: string;
  slug: string;
  type: string;
  themeId: string;
  packageKey: PackageKey;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      title: input.title,
      slug: input.slug,
      type: input.type,
      theme_id: input.themeId,
      package_key: input.packageKey,
      status: "draft",
      settings: defaultSettings(input.packageKey),
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Slug sudah dipakai invitation lain" };
    }
    return { error: error.message };
  }

  return { id: data.id };
}

export async function updateInvitationGeneral(input: {
  invitationId: string;
  title: string;
  slug: string;
  type: string;
  themeId: string;
  eventDate: string | null;
  venueSummary: string | null;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("invitations")
    .update({
      title: input.title,
      slug: input.slug,
      type: input.type,
      theme_id: input.themeId,
      event_date: input.eventDate,
      venue_summary: input.venueSummary,
    })
    .eq("id", input.invitationId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Slug sudah dipakai invitation lain" };
    }
    return { error: error.message };
  }

  return null;
}

export async function updateInvitationContent(input: {
  invitationId: string;
  openingQuote: string | null;
  openingMessage: string | null;
  closingMessage: string | null;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("invitations")
    .update({
      opening_quote: input.openingQuote,
      opening_message: input.openingMessage,
      closing_message: input.closingMessage,
    })
    .eq("id", input.invitationId);

  return error ? { error: error.message } : null;
}

export async function updateInvitationFeatures(input: {
  invitationId: string;
  features: InvitationFeatures;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { data: current, error: readError } = await supabase
    .from("invitations")
    .select("settings, package_key")
    .eq("id", input.invitationId)
    .single();

  if (readError) {
    return { error: readError.message };
  }

  const effectiveFeatures = resolveEffectiveInvitationFeatures(
    current.package_key as PackageKey,
    input.features,
  );
  for (const key of Object.keys(input.features) as (keyof InvitationFeatures)[]) {
    if (input.features[key] && !effectiveFeatures[key]) {
      const requiredPackage = getRequiredPackageForFeature(key);
      const labels: Partial<Record<keyof InvitationFeatures, string>> = {
        story: "Love Story",
        wishes: "Wishes",
        dressCode: "Dress Code",
        livestream: "Livestream",
      };
      return {
        error: requiredPackage
          ? `Fitur ${labels[key] ?? key} membutuhkan paket ${PACKAGE_DEFINITIONS[requiredPackage].label}.`
          : `Fitur ${labels[key] ?? key} tidak tersedia.`,
      };
    }
  }

  const settings = (current.settings ?? {}) as Record<string, unknown>;

  const { error } = await supabase
    .from("invitations")
    .update({ settings: { ...settings, features: { ...input.features } } as Json })
    .eq("id", input.invitationId);

  return error ? { error: error.message } : null;
}

/**
 * published_at always refreshes to now(). expires_at is only computed the
 * FIRST time an invitation is published (ARCHITECTURE.md section 10:
 * "expires_at generated if missing") — an unpublish/republish cycle must not
 * reset the 3-month clock, or the expiration limit becomes meaningless.
 */
export async function publishInvitation(
  invitationId: string,
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { data: current, error: readError } = await supabase
    .from("invitations")
    .select("settings, expires_at")
    .eq("id", invitationId)
    .single();

  if (readError) {
    return { error: readError.message };
  }

  const publishedAt = new Date();

  let expiresAt = current.expires_at;
  if (!expiresAt) {
    const settings = (current.settings ?? {}) as {
      expiration?: { monthsAfterPublish?: number };
    };
    const months = settings.expiration?.monthsAfterPublish ?? 3;
    const computed = new Date(publishedAt);
    computed.setMonth(computed.getMonth() + months);
    expiresAt = computed.toISOString();
  }

  const { error } = await supabase
    .from("invitations")
    .update({
      status: "published",
      published_at: publishedAt.toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", invitationId);

  return error ? { error: error.message } : null;
}

/**
 * Unpublish only flips status back to "draft" — published_at/expires_at are
 * left untouched (ROADMAP.md Phase 5's preferred default) so the admin can
 * still see when it was last published. Republishing always recomputes both
 * fields fresh (see publishInvitation), so a stale expires_at from a prior
 * publish cycle never leaks into the next one.
 */
export async function unpublishInvitation(
  invitationId: string,
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("invitations")
    .update({ status: "draft" })
    .eq("id", invitationId);

  return error ? { error: error.message } : null;
}

// --- People ---------------------------------------------------------------

export async function upsertPerson(input: {
  id?: string;
  invitationId: string;
  role: string;
  fullName: string;
  nickname: string | null;
  fatherName: string | null;
  motherName: string | null;
  bio: string | null;
  sortOrder: number;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const row = {
    invitation_id: input.invitationId,
    role: input.role,
    full_name: input.fullName,
    nickname: input.nickname,
    father_name: input.fatherName,
    mother_name: input.motherName,
    bio: input.bio,
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await supabase.from("invitation_people").update(row).eq("id", input.id)
    : await supabase.from("invitation_people").insert(row);

  return error ? { error: error.message } : null;
}

export async function deletePerson(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("invitation_people").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

// --- Events ------------------------------------------------------------

export async function upsertEvent(input: {
  id?: string;
  invitationId: string;
  eventType: string | null;
  title: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venueName: string | null;
  address: string | null;
  mapsUrl: string | null;
  livestreamUrl: string | null;
  sortOrder: number;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  if (!input.id) {
    const [{ data: invitation, error: invitationError }, { count, error: countError }] =
      await Promise.all([
        supabase
          .from("invitations")
          .select("package_key")
          .eq("id", input.invitationId)
          .single(),
        supabase
          .from("invitation_events")
          .select("id", { count: "exact", head: true })
          .eq("invitation_id", input.invitationId),
      ]);

    if (invitationError) return { error: invitationError.message };
    if (countError) return { error: countError.message };

    const policyError = validatePackageCapacity(
      invitation.package_key as PackageKey,
      "events",
      count ?? 0,
      1,
    );
    if (policyError) return { error: policyError.message };
  }

  const row = {
    event_type: input.eventType,
    title: input.title,
    event_date: input.eventDate,
    start_time: input.startTime,
    end_time: input.endTime,
    venue_name: input.venueName,
    address: input.address,
    maps_url: input.mapsUrl,
    livestream_url: input.livestreamUrl,
    sort_order: input.sortOrder,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("invitation_events")
      .update(row)
      .eq("id", input.id)
      .eq("invitation_id", input.invitationId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    return data ? null : { error: "Acara tidak ditemukan pada undangan ini." };
  }

  const { error } = await supabase.from("invitation_events").insert({
    ...row,
    invitation_id: input.invitationId,
  });
  return error ? { error: error.message } : null;
}

export async function deleteEvent(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("invitation_events").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

// --- Stories (love story) ------------------------------------------------

export async function upsertStory(input: {
  id?: string;
  invitationId: string;
  title: string;
  yearLabel: string | null;
  storyDate: string | null;
  description: string | null;
  sortOrder: number;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const row = {
    invitation_id: input.invitationId,
    title: input.title,
    year_label: input.yearLabel,
    story_date: input.storyDate,
    description: input.description,
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await supabase.from("invitation_stories").update(row).eq("id", input.id)
    : await supabase.from("invitation_stories").insert(row);

  return error ? { error: error.message } : null;
}

export async function deleteStory(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("invitation_stories").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

// --- Gift accounts ---------------------------------------------------------

export async function upsertGiftAccount(input: {
  id?: string;
  invitationId: string;
  providerType: string;
  providerName: string;
  accountNumber: string;
  accountName: string;
  sortOrder: number;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const row = {
    invitation_id: input.invitationId,
    provider_type: input.providerType,
    provider_name: input.providerName,
    account_number: input.accountNumber,
    account_name: input.accountName,
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await supabase.from("gift_accounts").update(row).eq("id", input.id)
    : await supabase.from("gift_accounts").insert(row);

  return error ? { error: error.message } : null;
}

export async function deleteGiftAccount(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gift_accounts").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

// --- Guests ------------------------------------------------------------

export async function createGuest(input: {
  invitationId: string;
  displayName: string;
  notes: string | null;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("guests").insert({
    invitation_id: input.invitationId,
    display_name: input.displayName,
    notes: input.notes,
    token: randomUUID(),
  });

  return error ? { error: error.message } : null;
}

export async function deleteGuest(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

// --- Gallery item metadata (upload handled in server/media/upload.ts) -----

export async function deleteGalleryItem(
  id: string,
  imagePath: string,
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error: storageError } = await supabase.storage
    .from("invitation-media")
    .remove([imagePath]);

  if (storageError) {
    return { error: storageError.message };
  }

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  return error ? { error: error.message } : null;
}

export async function updateGalleryItemMeta(input: {
  id: string;
  caption: string | null;
  altText: string | null;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("gallery_items")
    .update({ caption: input.caption, alt_text: input.altText })
    .eq("id", input.id);

  return error ? { error: error.message } : null;
}

export async function updateGalleryItemRatio(input: {
  id: string;
  invitationId: string;
  aspectRatio: string;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("gallery_items")
    .update({ aspect_ratio: input.aspectRatio })
    .eq("id", input.id)
    .eq("invitation_id", input.invitationId);

  return error ? { error: error.message } : null;
}

export async function reorderGalleryItems(input: {
  invitationId: string;
  orderedIds: string[];
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const updates = input.orderedIds.map((id, index) =>
    supabase.from("gallery_items").update({ sort_order: index }).eq("id", id).eq("invitation_id", input.invitationId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  return failed?.error ? { error: failed.error.message } : null;
}

// --- Wishes moderation ---------------------------------------------------

export async function setWishVisibility(
  id: string,
  isVisible: boolean,
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("wishes").update({ is_visible: isVisible }).eq("id", id);
  return error ? { error: error.message } : null;
}

export async function deleteWish(id: string): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  return error ? { error: error.message } : null;
}
