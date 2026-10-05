import { getSupabaseUrl } from "./env";

const BUCKET = "invitation-media";

/**
 * Builds the public URL for an object path stored in the invitation-media
 * bucket. Paths starting with "/" are static files shipped with the app
 * (the demo placeholders in public/demo) and are returned unchanged.
 */
export function getMediaPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${path}`;
}

export { BUCKET as INVITATION_MEDIA_BUCKET };
