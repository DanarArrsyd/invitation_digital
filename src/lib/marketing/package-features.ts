import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import type { InvitationFeatures } from "@/types/invitation";

/** Guest-facing names for features that exist in every theme today. */
export const FEATURE_LABELS: Record<keyof InvitationFeatures, string> = {
  guestPersonalization: "Nama tamu di setiap link",
  rsvp: "Konfirmasi kehadiran (RSVP)",
  countdown: "Hitung mundur + simpan ke kalender",
  maps: "Tombol lokasi Google Maps",
  gallery: "Galeri foto",
  music: "Musik latar",
  gift: "Amplop digital",
  wishes: "Ucapan & doa tamu",
  story: "Love story",
  dressCode: "Dress code",
  livestream: "Link live streaming",
};

const FEATURE_ORDER: (keyof InvitationFeatures)[] = [
  "guestPersonalization",
  "rsvp",
  "countdown",
  "maps",
  "gallery",
  "music",
  "gift",
  "wishes",
  "story",
  "dressCode",
  "livestream",
];

/**
 * What a package includes, in display order. Only features and capabilities
 * the product actually ships are listed, so the site never promises more
 * than the editor can deliver.
 */
export function getPackageHighlights(packageKey: PackageKey): string[] {
  const definition = PACKAGE_DEFINITIONS[packageKey];
  const highlights = [
    `Hingga ${definition.limits.maxEvents} acara`,
    `Hingga ${definition.limits.maxGalleryImages} foto galeri`,
    ...FEATURE_ORDER.filter((key) => key !== "gallery" && definition.invitationFeatures[key]).map(
      (key) => FEATURE_LABELS[key],
    ),
  ];
  if (definition.capabilities.instagram) highlights.push("Tautan Instagram");
  return highlights;
}
