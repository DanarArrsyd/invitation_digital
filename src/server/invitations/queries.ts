import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type InvitationListItem = Pick<
  Tables<"invitations">,
  | "id"
  | "title"
  | "slug"
  | "type"
  | "status"
  | "event_date"
  | "expires_at"
  | "published_at"
  | "cover_image_path"
  | "package_key"
  | "venue_summary"
> & {
  theme: Pick<Tables<"themes">, "name" | "slug"> | null;
  gallery_items: Pick<Tables<"gallery_items">, "image_path">[];
  guests: { count: number }[];
  rsvps: { count: number }[];
  wishes: { count: number }[];
};

/** Case-insensitive match on title or slug; an empty search keeps everything. */
export function matchesInvitationSearch(
  invitation: Pick<InvitationListItem, "title" | "slug">,
  search: string | undefined,
): boolean {
  const term = (search ?? "").trim().toLowerCase();
  if (!term) return true;
  return invitation.title.toLowerCase().includes(term) || invitation.slug.toLowerCase().includes(term);
}

export type InvitationSort = "recent" | "event";

export async function listInvitations(
  status?: string,
  search?: string,
  sort: InvitationSort = "recent",
): Promise<InvitationListItem[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("invitations")
    .select(
      "id, title, slug, type, status, event_date, expires_at, published_at, cover_image_path, package_key, venue_summary, theme:themes(name, slug), gallery_items(image_path), guests(count), rsvps(count), wishes(count)",
    )
    .order("sort_order", { referencedTable: "gallery_items", ascending: true })
    .limit(1, { foreignTable: "gallery_items" })
    .order("created_at", { ascending: false });

  // Filters follow the effective status (see lib/invitations/status.ts): a
  // published row past its expires_at belongs under "expired".
  // Demo invitations only appear under their own filter.
  query = query.eq("is_demo", status === "demo");

  const now = new Date().toISOString();
  if (status === "published") {
    query = query.eq("status", "published").or(`expires_at.is.null,expires_at.gt.${now}`);
  } else if (status === "expired") {
    query = query.or(`status.eq.expired,and(status.eq.published,expires_at.lte.${now})`);
  } else if (status && status !== "all" && status !== "demo") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const matches = data.filter((invitation) => matchesInvitationSearch(invitation, search));
  return sort === "event" ? sortByUpcomingEvent(matches) : matches;
}

/**
 * Upcoming events first (soonest on top), then undated invitations, then
 * past events (most recent first). `today` is a YYYY-MM-DD date.
 */
export function sortByUpcomingEvent<T extends { event_date: string | null }>(
  items: T[],
  today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }),
): T[] {
  const rank = (date: string | null) => (date === null ? 1 : date >= today ? 0 : 2);
  return [...items].sort((a, b) => {
    const byRank = rank(a.event_date) - rank(b.event_date);
    if (byRank !== 0) return byRank;
    if (a.event_date === null || b.event_date === null) return 0;
    return rank(a.event_date) === 0
      ? a.event_date.localeCompare(b.event_date)
      : b.event_date.localeCompare(a.event_date);
  });
}

export type InvitationStatusCounts = Record<"all" | "draft" | "published" | "expired" | "demo", number>;

/** How many invitations each status tab holds, by effective status. */
export async function countInvitationsByStatus(): Promise<InvitationStatusCounts> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("invitations").select("status, expires_at, is_demo");
  if (error) throw new Error(error.message);

  const now = Date.now();
  const counts: InvitationStatusCounts = { all: 0, draft: 0, published: 0, expired: 0, demo: 0 };
  for (const row of data) {
    if (row.is_demo) {
      counts.demo += 1;
      continue;
    }
    counts.all += 1;
    const lapsed = row.status === "published" && row.expires_at !== null && new Date(row.expires_at).getTime() <= now;
    if (row.status === "expired" || lapsed) counts.expired += 1;
    else if (row.status === "published") counts.published += 1;
    else if (row.status === "draft") counts.draft += 1;
  }
  return counts;
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

/**
 * Everything the editor needs for one invitation. Request-cached so the
 * editor layout (header, readiness) and the section page share one fetch.
 */
export const getInvitationDetail = cache(async (invitationId: string): Promise<InvitationDetail | null> => {
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
});

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
 * never from analytics_events — see docs/ROADMAP.md Phase 6 section 7. This only
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
