import type { SupabaseClient } from "@supabase/supabase-js";

import { getMediaPublicUrl } from "@/lib/supabase/storage";
import type { Database, Tables } from "@/types/database";
import type { InvitationFeatures, PublicInvitation } from "@/types/invitation";

const DEFAULT_FEATURES: InvitationFeatures = {
  music: false,
  countdown: false,
  maps: false,
  story: false,
  gallery: false,
  livestream: false,
  rsvp: false,
  wishes: false,
  gift: false,
  guestPersonalization: false,
};

type InvitationRow = Tables<"invitations"> & { theme: Tables<"themes"> };

/**
 * Shared by the public loader (published/non-expired only) and the admin
 * preview loader (any status) — the ONE place raw rows become the
 * normalized `PublicInvitation` contract ThemeRenderer consumes. Never
 * duplicate this mapping elsewhere.
 */
export async function loadNormalizedInvitation(
  supabase: SupabaseClient<Database>,
  invitation: InvitationRow,
): Promise<PublicInvitation> {
  const [peopleRes, eventsRes, storiesRes, galleryRes, giftsRes, wishesRes] = await Promise.all([
    supabase
      .from("invitation_people")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("invitation_events")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("invitation_stories")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gift_accounts")
      .select("*")
      .eq("invitation_id", invitation.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("wishes")
      .select("*")
      .eq("invitation_id", invitation.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false }),
  ]);

  for (const res of [peopleRes, eventsRes, storiesRes, galleryRes, giftsRes, wishesRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const settings = (invitation.settings ?? {}) as {
    features?: Partial<InvitationFeatures>;
  };
  const features: InvitationFeatures = { ...DEFAULT_FEATURES, ...settings.features };

  return {
    id: invitation.id,
    type: invitation.type as PublicInvitation["type"],
    slug: invitation.slug,
    title: invitation.title,
    status: "published",
    eventDate: invitation.event_date,
    venueSummary: invitation.venue_summary,
    publishedAt: invitation.published_at ?? invitation.created_at,
    expiresAt: invitation.expires_at,

    theme: {
      slug: invitation.theme.slug,
      settings: settings as Record<string, unknown>,
    },

    people: (peopleRes.data ?? []).map((p) => ({
      id: p.id,
      role: p.role as PublicInvitation["people"][number]["role"],
      fullName: p.full_name,
      nickname: p.nickname,
      fatherName: p.father_name,
      motherName: p.mother_name,
      photoUrl: getMediaPublicUrl(p.photo_path),
      bio: p.bio,
      sortOrder: p.sort_order,
    })),

    events: (eventsRes.data ?? []).map((e) => ({
      id: e.id,
      eventType: e.event_type,
      title: e.title,
      eventDate: e.event_date,
      startTime: e.start_time,
      endTime: e.end_time,
      venueName: e.venue_name,
      address: e.address,
      mapsUrl: e.maps_url,
      livestreamUrl: e.livestream_url,
      sortOrder: e.sort_order,
    })),

    stories: (storiesRes.data ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      storyDate: s.story_date,
      yearLabel: s.year_label,
      description: s.description,
      imageUrl: getMediaPublicUrl(s.image_path),
      sortOrder: s.sort_order,
    })),

    gallery: (galleryRes.data ?? []).map((g) => ({
      id: g.id,
      imageUrl: getMediaPublicUrl(g.image_path) ?? "",
      caption: g.caption,
      altText: g.alt_text,
      sortOrder: g.sort_order,
    })),

    gifts: (giftsRes.data ?? []).map((g) => ({
      id: g.id,
      providerType: g.provider_type,
      providerName: g.provider_name,
      accountNumber: g.account_number,
      accountName: g.account_name,
      logoUrl: getMediaPublicUrl(g.logo_path),
      sortOrder: g.sort_order,
    })),

    wishes: (wishesRes.data ?? []).map((w) => ({
      id: w.id,
      guestId: w.guest_id,
      guestName: w.guest_name,
      message: w.message,
      isVisible: w.is_visible,
      createdAt: w.created_at,
    })),

    content: {
      openingQuote: invitation.opening_quote,
      openingMessage: invitation.opening_message,
      closingMessage: invitation.closing_message,
    },

    features,

    media: {
      musicUrl: getMediaPublicUrl(invitation.music_path),
      coverImageUrl: getMediaPublicUrl(invitation.cover_image_path),
    },
  };
}
