import { randomUUID } from "node:crypto";

import { INVITATION_MEDIA_BUCKET } from "@/lib/supabase/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type MediaKind, validateMediaFile } from "@/lib/validation/media";

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/").pop() ?? "bin";
}

async function uploadObject(
  invitationId: string,
  kind: MediaKind,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const validation = validateMediaFile(file, kind);
  if (!validation.ok) {
    return { error: validation.error };
  }

  const path = `invitations/${invitationId}/${kind}/${randomUUID()}.${extensionFor(file)}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(INVITATION_MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { error: error.message };
  }

  return { path };
}

async function removeObject(path: string | null): Promise<void> {
  if (!path) return;
  const supabase = await createSupabaseServerClient();
  await supabase.storage.from(INVITATION_MEDIA_BUCKET).remove([path]);
}

export async function uploadPersonPhoto(
  invitationId: string,
  personId: string,
  file: File,
): Promise<{ error: string } | null> {
  const result = await uploadObject(invitationId, "people", file);
  if ("error" in result) return { error: result.error };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("invitation_people")
    .select("photo_path")
    .eq("id", personId)
    .single();

  const { error } = await supabase
    .from("invitation_people")
    .update({ photo_path: result.path })
    .eq("id", personId);

  if (error) return { error: error.message };

  await removeObject(existing?.photo_path ?? null);
  return null;
}

export async function uploadCoverImage(
  invitationId: string,
  file: File,
): Promise<{ error: string } | null> {
  const result = await uploadObject(invitationId, "cover", file);
  if ("error" in result) return { error: result.error };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("invitations")
    .select("cover_image_path")
    .eq("id", invitationId)
    .single();

  const { error } = await supabase
    .from("invitations")
    .update({ cover_image_path: result.path })
    .eq("id", invitationId);

  if (error) return { error: error.message };

  await removeObject(existing?.cover_image_path ?? null);
  return null;
}

export async function uploadMusic(
  invitationId: string,
  file: File,
): Promise<{ error: string } | null> {
  const result = await uploadObject(invitationId, "music", file);
  if ("error" in result) return { error: result.error };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("invitations")
    .select("music_path")
    .eq("id", invitationId)
    .single();

  const { error } = await supabase
    .from("invitations")
    .update({ music_path: result.path })
    .eq("id", invitationId);

  if (error) return { error: error.message };

  await removeObject(existing?.music_path ?? null);
  return null;
}

export async function uploadGalleryItems(
  invitationId: string,
  files: File[],
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("gallery_items")
    .select("id", { count: "exact", head: true })
    .eq("invitation_id", invitationId);

  let nextSortOrder = count ?? 0;

  for (const file of files) {
    const result = await uploadObject(invitationId, "gallery", file);
    if ("error" in result) {
      return { error: `${file.name}: ${result.error}` };
    }

    const { error } = await supabase.from("gallery_items").insert({
      invitation_id: invitationId,
      image_path: result.path,
      caption: null,
      alt_text: null,
      sort_order: nextSortOrder,
    });

    if (error) {
      await removeObject(result.path);
      return { error: `${file.name}: ${error.message}` };
    }

    nextSortOrder += 1;
  }

  return null;
}

export async function uploadStoryImage(
  invitationId: string,
  storyId: string,
  file: File,
): Promise<{ error: string } | null> {
  const result = await uploadObject(invitationId, "stories", file);
  if ("error" in result) return { error: result.error };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("invitation_stories")
    .select("image_path")
    .eq("id", storyId)
    .single();

  const { error } = await supabase
    .from("invitation_stories")
    .update({ image_path: result.path })
    .eq("id", storyId);

  if (error) return { error: error.message };

  await removeObject(existing?.image_path ?? null);
  return null;
}
