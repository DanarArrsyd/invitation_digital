export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp4", "audio/wav"] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export type MediaKind = "people" | "gallery" | "cover" | "music" | "stories";

export function validateMediaFile(
  file: File,
  kind: MediaKind,
): { ok: true } | { ok: false; error: string } {
  if (file.size === 0) {
    return { ok: false, error: "File kosong" };
  }

  if (kind === "music") {
    if (!AUDIO_MIME_TYPES.includes(file.type as (typeof AUDIO_MIME_TYPES)[number])) {
      return { ok: false, error: "Format musik tidak didukung (mp3/m4a/wav)" };
    }
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      return { ok: false, error: "Ukuran musik maksimal 15MB" };
    }
    return { ok: true };
  }

  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    return { ok: false, error: "Format gambar tidak didukung (jpg/png/webp)" };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 5MB" };
  }
  return { ok: true };
}
