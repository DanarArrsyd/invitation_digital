import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardSummary {
  counts: {
    draft: number;
    published: number;
    expired: number;
    archived: number;
    total: number;
  };
  expiringSoon: { id: string; title: string; slug: string; expiresAt: string }[];
}

const EXPIRING_SOON_WINDOW_DAYS = 14;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("id, title, slug, status, expires_at");

  if (error) {
    throw new Error(error.message);
  }

  const counts = { draft: 0, published: 0, expired: 0, archived: 0, total: data.length };
  for (const row of data) {
    if (row.status in counts) {
      (counts as Record<string, number>)[row.status] += 1;
    }
  }

  const now = Date.now();
  const windowMs = EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const expiringSoon = data
    .filter((row) => {
      if (row.status !== "published" || !row.expires_at) return false;
      const expiresAt = new Date(row.expires_at).getTime();
      return expiresAt > now && expiresAt - now <= windowMs;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      expiresAt: row.expires_at as string,
    }))
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  return { counts, expiringSoon };
}
