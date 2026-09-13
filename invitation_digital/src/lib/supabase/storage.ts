import { getSupabaseUrl } from "./env";

const BUCKET = "invitation-media";

/** Builds the public URL for an object path stored in the invitation-media bucket. */
export function getMediaPublicUrl(path: string | null): string | null {
  if (!path) return null;
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${path}`;
}

export { BUCKET as INVITATION_MEDIA_BUCKET };
