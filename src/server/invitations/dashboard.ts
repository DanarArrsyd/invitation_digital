import { effectiveInvitationStatus, type InvitationStatus } from "@/lib/invitations/status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardInvitation {
  id: string;
  title: string;
  slug: string;
  status: InvitationStatus;
  eventDate: string | null;
  expiresAt: string | null;
  updatedAt: string;
  themeName: string | null;
  guestCount: number;
  rsvpCount: number;
  wishCount: number;
}

export type AttentionReason = "expiring" | "draft" | "no_guests";

export interface AttentionItem {
  reason: AttentionReason;
  invitation: DashboardInvitation;
}

export interface DashboardSummary {
  counts: {
    draft: number;
    published: number;
    expired: number;
    archived: number;
    total: number;
  };
  totals: { guests: number; rsvps: number; wishes: number };
  /** Most recently edited first. */
  recent: DashboardInvitation[];
  attention: AttentionItem[];
}

const EXPIRING_SOON_WINDOW_DAYS = 14;
const RECENT_LIMIT = 5;
const ATTENTION_LIMIT = 6;

function embeddedCount(value: { count: number }[] | null | undefined): number {
  return value?.[0]?.count ?? 0;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("invitations")
    .select(
      "id, title, slug, status, event_date, expires_at, updated_at, theme:themes(name), guests(count), rsvps(count), wishes(count)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const now = Date.now();
  const invitations: DashboardInvitation[] = data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: effectiveInvitationStatus(row.status, row.expires_at, now),
    eventDate: row.event_date,
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
    themeName: row.theme?.name ?? null,
    guestCount: embeddedCount(row.guests),
    rsvpCount: embeddedCount(row.rsvps),
    wishCount: embeddedCount(row.wishes),
  }));

  const counts = { draft: 0, published: 0, expired: 0, archived: 0, total: invitations.length };
  const totals = { guests: 0, rsvps: 0, wishes: 0 };
  for (const invitation of invitations) {
    counts[invitation.status] += 1;
    totals.guests += invitation.guestCount;
    totals.rsvps += invitation.rsvpCount;
    totals.wishes += invitation.wishCount;
  }

  const windowMs = EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const isExpiringSoon = (invitation: DashboardInvitation) => {
    if (invitation.status !== "published" || !invitation.expiresAt) return false;
    const expiresAt = new Date(invitation.expiresAt).getTime();
    return expiresAt > now && expiresAt - now <= windowMs;
  };

  // Most urgent first: live links about to stop working, then unpublished
  // drafts, then live invitations with no personal guest links yet.
  const listed = new Set<string>();
  const attention: AttentionItem[] = [
    ...invitations
      .filter(isExpiringSoon)
      .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
      .map((invitation) => ({ reason: "expiring" as const, invitation })),
    ...invitations
      .filter((invitation) => invitation.status === "draft")
      .map((invitation) => ({ reason: "draft" as const, invitation })),
    ...invitations
      .filter((invitation) => invitation.status === "published" && invitation.guestCount === 0)
      .map((invitation) => ({ reason: "no_guests" as const, invitation })),
  ]
    .filter(({ invitation }) => !listed.has(invitation.id) && Boolean(listed.add(invitation.id)))
    .slice(0, ATTENTION_LIMIT);

  return { counts, totals, recent: invitations.slice(0, RECENT_LIMIT), attention };
}
