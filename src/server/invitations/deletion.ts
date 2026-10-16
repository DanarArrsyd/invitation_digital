import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { INVITATION_MEDIA_BUCKET } from "@/lib/supabase/storage";

const LIST_PAGE_SIZE = 100;
const REMOVE_BATCH_SIZE = 100;

export async function queueInvitationDeletion(
  invitationId: string,
  confirmationSlug: string,
): Promise<{ slug: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: userResult, error: authError } = await supabase.auth.getUser();
  if (authError || !userResult.user) return { error: "Sesi admin tidak valid." };

  const { data, error } = await supabase.rpc("queue_invitation_deletion", {
    p_invitation_id: invitationId,
    p_confirmation_slug: confirmationSlug,
  });
  if (error) return { error: error.message };
  return { slug: data };
}

async function listAllMediaPaths(prefix: string): Promise<string[]> {
  const storage = createSupabaseAdminClient().storage.from(INVITATION_MEDIA_BUCKET);
  const paths: string[] = [];
  const folders = [prefix];

  while (folders.length > 0) {
    const folder = folders.pop()!;
    let offset = 0;

    while (true) {
      const { data, error } = await storage.list(folder, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      for (const entry of data) {
        const path = `${folder}/${entry.name}`;
        if (entry.id === null) folders.push(path);
        else paths.push(path);
      }
      if (data.length < LIST_PAGE_SIZE) break;
      offset += data.length;
    }
  }

  return paths;
}

/** Safe to retry: the job remains until Storage is empty and the job is removed. */
export async function cleanupDeletedInvitationMedia(
  invitationId: string,
): Promise<{ error: string } | null> {
  const userClient = await createSupabaseServerClient();
  const { data: userResult, error: authError } = await userClient.auth.getUser();
  if (authError || !userResult.user) return { error: "Sesi admin tidak valid." };

  const { data: job, error: jobError } = await userClient
    .from("invitation_deletion_jobs")
    .select("invitation_id")
    .eq("invitation_id", invitationId)
    .maybeSingle();
  if (jobError) return { error: jobError.message };
  if (!job) return { error: "Antrean pembersihan tidak ditemukan." };

  const admin = createSupabaseAdminClient();
  try {
    const paths = await listAllMediaPaths(`invitations/${job.invitation_id}`);
    for (let i = 0; i < paths.length; i += REMOVE_BATCH_SIZE) {
      const { error } = await admin.storage
        .from(INVITATION_MEDIA_BUCKET)
        .remove(paths.slice(i, i + REMOVE_BATCH_SIZE));
      if (error) throw error;
    }

    const { error } = await admin
      .from("invitation_deletion_jobs")
      .delete()
      .eq("invitation_id", job.invitation_id);
    if (error) throw error;
    return null;
  } catch (cause) {
    const message = cause && typeof cause === "object" && "message" in cause
      ? String(cause.message)
      : "Pembersihan media gagal.";
    await admin
      .from("invitation_deletion_jobs")
      .update({ last_error: message.slice(0, 500) })
      .eq("invitation_id", job.invitation_id);
    return { error: "Data undangan terhapus, tetapi pembersihan media masih tertunda." };
  }
}

export async function listPendingInvitationDeletions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invitation_deletion_jobs")
    .select("invitation_id, slug, created_at, last_error")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
