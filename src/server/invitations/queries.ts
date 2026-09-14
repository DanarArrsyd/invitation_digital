import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type InvitationListItem = Pick<
  Tables<"invitations">,
  "id" | "title" | "slug" | "type" | "status" | "event_date"
> & {
  theme: Pick<Tables<"themes">, "name" | "slug"> | null;
  gallery_items: Pick<Tables<"gallery_items">, "image_path">[];
};

export async function listInvitations(status?: string): Promise<InvitationListItem[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("invitations")
    .select(
      "id, title, slug, type, status, event_date, theme:themes(name, slug), gallery_items(image_path)",
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listActiveThemes(): Promise<Tables<"themes">[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export interface InvitationDetail {
  invitation: Tables<"invitations">;
  people: Tables<"invitation_people">[];
  events: Tables<"invitation_events">[];
  stories: Tables<"invitation_stories">[];
  gallery: Tables<"gallery_items">[];
  gifts: Tables<"gift_accounts">[];
  guests: Tables<"guests">[];
  themes: Tables<"themes">[];
}

export async function getInvitationDetail(invitationId: string): Promise<InvitationDetail | null> {
  const supabase = await createSupabaseServerClient();

  const [invitationRes, peopleRes, eventsRes, storiesRes, galleryRes, giftsRes, guestsRes, themesRes] =
    await Promise.all([
      supabase.from("invitations").select("*").eq("id", invitationId).maybeSingle(),
      supabase
        .from("invitation_people")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("invitation_events")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("invitation_stories")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("gallery_items")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("gift_accounts")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("guests")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: false }),
      supabase.from("themes").select("*").eq("is_active", true).order("name", { ascending: true }),
    ]);

  if (invitationRes.error) throw new Error(invitationRes.error.message);
  if (!invitationRes.data) return null;
  if (peopleRes.error) throw new Error(peopleRes.error.message);
  if (eventsRes.error) throw new Error(eventsRes.error.message);
  if (storiesRes.error) throw new Error(storiesRes.error.message);
  if (galleryRes.error) throw new Error(galleryRes.error.message);
  if (giftsRes.error) throw new Error(giftsRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (themesRes.error) throw new Error(themesRes.error.message);

  return {
    invitation: invitationRes.data,
    people: peopleRes.data,
    events: eventsRes.data,
    stories: storiesRes.data,
    gallery: galleryRes.data,
    gifts: giftsRes.data,
    guests: guestsRes.data,
    themes: themesRes.data,
  };
}

export interface InvitationResponses {
  rsvps: Tables<"rsvps">[];
  wishes: Tables<"wishes">[];
}

export async function getInvitationResponses(invitationId: string): Promise<InvitationResponses> {
  const supabase = await createSupabaseServerClient();

  const [rsvpsRes, wishesRes] = await Promise.all([
    supabase
      .from("rsvps")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishes")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false }),
  ]);

  if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);
  if (wishesRes.error) throw new Error(wishesRes.error.message);

  return { rsvps: rsvpsRes.data, wishes: wishesRes.data };
}

export interface InvitationAnalyticsSummary {
  totalOpens: number;
  uniqueVisitors: number;
  coverOpened: number;
}

/**
 * RSVP/wishes counts come from their own tables (getInvitationResponses),
 * never from analytics_events — see ROADMAP.md Phase 6 section 7. This only
 * covers what has no other source of truth: opens and unique sessions.
 */
export async function getInvitationAnalyticsSummary(
  invitationId: string,
): Promise<InvitationAnalyticsSummary> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type, session_id")
    .eq("invitation_id", invitationId);

  if (error) throw new Error(error.message);

  const opens = (data ?? []).filter((e) => e.event_type === "invitation_open");
  const coverOpened = (data ?? []).filter((e) => e.event_type === "cover_opened").length;
  const uniqueVisitors = new Set(opens.map((e) => e.session_id).filter(Boolean)).size;

  return { totalOpens: opens.length, uniqueVisitors, coverOpened };
}
