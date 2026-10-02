import type { InvitationFeatures } from "@/types/invitation";

export type ReadinessItem = {
  key: string;
  label: string;
  /** Section slug under /admin/invitations/[id]/ where it is fixed. */
  section: string;
  done: boolean;
  /** "required": guests can't use the invitation without it. */
  level: "required" | "recommended";
  hint: string;
};

export type ReadinessInput = {
  features: InvitationFeatures;
  peopleCount: number;
  eventCount: number;
  hasCoverImage: boolean;
  hasMusic: boolean;
  galleryCount: number;
  giftCount: number;
  storyCount: number;
  guestCount: number;
};

/**
 * Pre-publish checklist. Informational only: publishing stays possible,
 * but the admin sees what guests would find missing. Feature-dependent
 * items appear only when that section is switched on.
 */
export function getPublishReadiness(input: ReadinessInput): ReadinessItem[] {
  const { features } = input;
  const items: (ReadinessItem | null)[] = [
    {
      key: "people",
      label: "Data mempelai",
      section: "people",
      done: input.peopleCount > 0,
      level: "required",
      hint: "Nama yang tampil di cover dan sepanjang undangan.",
    },
    {
      key: "events",
      label: "Minimal satu acara",
      section: "events",
      done: input.eventCount > 0,
      level: "required",
      hint: "Tanggal, jam dan lokasi yang dicari tamu.",
    },
    {
      key: "cover",
      label: "Foto prewedding",
      section: "general",
      done: input.hasCoverImage,
      level: "recommended",
      hint: "Foto utama setelah undangan dibuka.",
    },
    features.gallery
      ? {
          key: "gallery",
          label: "Foto galeri",
          section: "gallery",
          done: input.galleryCount > 0,
          level: "recommended",
          hint: "Galeri aktif tapi belum ada foto; section-nya tidak akan tampil.",
        }
      : null,
    features.story
      ? {
          key: "story",
          label: "Love story",
          section: "content",
          done: input.storyCount > 0,
          level: "recommended",
          hint: "Love story aktif tapi belum ada cerita; section-nya tidak akan tampil.",
        }
      : null,
    features.gift
      ? {
          key: "gift",
          label: "Rekening hadiah",
          section: "gifts",
          done: input.giftCount > 0,
          level: "recommended",
          hint: "Wedding gift aktif tapi belum ada rekening; section-nya tidak akan tampil.",
        }
      : null,
    features.music
      ? {
          key: "music",
          label: "Musik latar",
          section: "general",
          done: input.hasMusic,
          level: "recommended",
          hint: "Musik aktif tapi belum ada file; tombol musik tidak akan tampil.",
        }
      : null,
    features.guestPersonalization
      ? {
          key: "guests",
          label: "Daftar tamu",
          section: "guests",
          done: input.guestCount > 0,
          level: "recommended",
          hint: "Tanpa tamu, tidak ada link personal untuk dibagikan.",
        }
      : null,
  ];
  return items.filter((item): item is ReadinessItem => item !== null);
}
