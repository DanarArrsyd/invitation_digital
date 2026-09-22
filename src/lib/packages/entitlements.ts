import type { InvitationFeatures } from "@/types/invitation";

export const PACKAGE_KEYS = ["intimate", "signature", "grand"] as const;
export type PackageKey = (typeof PACKAGE_KEYS)[number];

export type PackageCapability =
  | keyof InvitationFeatures
  | "instagram"
  | "rsvpExport"
  | "sponsorship"
  | "videoGallery"
  | "advancedRsvp"
  | "analytics"
  | "stylePresets";

export interface PackagePolicyError {
  code:
    | "PACKAGE_EVENT_LIMIT_REACHED"
    | "PACKAGE_GALLERY_LIMIT_REACHED"
    | "PACKAGE_FEATURE_NOT_AVAILABLE"
    | "PACKAGE_DOWNGRADE_CONFLICT";
  message: string;
  packageKey: PackageKey;
  current?: number;
  limit?: number;
}

type PackageCapabilities =
  | "instagram"
  | "rsvpExport"
  | "sponsorship"
  | "videoGallery"
  | "advancedRsvp"
  | "analytics"
  | "stylePresets";

export interface PackageDefinition {
  key: PackageKey;
  label: string;
  description: string;
  recommended: boolean;
  limits: { maxEvents: number; maxGalleryImages: number; maxSponsors: number };
  invitationFeatures: Record<keyof InvitationFeatures, boolean>;
  capabilities: Record<PackageCapabilities, boolean>;
}

export type PackageCapacityResource = "events" | "gallery";

export interface PackageChangeConflict {
  kind: "events" | "gallery" | "feature";
  code: PackagePolicyError["code"];
  message: string;
  packageKey: PackageKey;
  current?: number;
  limit?: number;
  feature?: keyof InvitationFeatures;
}

export interface InvitationPackageSnapshot {
  eventCount: number;
  galleryCount: number;
  enabledFeatures: Partial<InvitationFeatures>;
}

const INVITATION_FEATURE_KEYS = [
  "music",
  "countdown",
  "maps",
  "story",
  "gallery",
  "dressCode",
  "livestream",
  "rsvp",
  "wishes",
  "gift",
  "guestPersonalization",
] as const satisfies ReadonlyArray<keyof InvitationFeatures>;

const universalInvitationFeatures: Record<keyof InvitationFeatures, boolean> = {
  music: true,
  countdown: true,
  maps: true,
  story: false,
  gallery: true,
  dressCode: false,
  livestream: false,
  rsvp: true,
  wishes: false,
  gift: true,
  guestPersonalization: true,
};

const signatureInvitationFeatures: Record<keyof InvitationFeatures, boolean> = {
  ...universalInvitationFeatures,
  story: true,
  dressCode: true,
  wishes: true,
};

const grandInvitationFeatures: Record<keyof InvitationFeatures, boolean> = {
  ...signatureInvitationFeatures,
  livestream: true,
};

const intimateCapabilities: Record<PackageCapabilities, boolean> = {
  instagram: false,
  rsvpExport: false,
  sponsorship: false,
  videoGallery: false,
  advancedRsvp: false,
  analytics: false,
  stylePresets: false,
};

const signatureCapabilities: Record<PackageCapabilities, boolean> = {
  ...intimateCapabilities,
  instagram: true,
  rsvpExport: true,
  sponsorship: true,
};

const grandCapabilities: Record<PackageCapabilities, boolean> = {
  ...signatureCapabilities,
  videoGallery: true,
  advancedRsvp: true,
  analytics: true,
  stylePresets: true,
};

export const PACKAGE_DEFINITIONS: Record<PackageKey, PackageDefinition> = {
  intimate: {
    key: "intimate",
    label: "Intimate",
    description: "Untuk undangan sederhana dan hangat.",
    recommended: false,
    limits: { maxEvents: 2, maxGalleryImages: 8, maxSponsors: 0 },
    invitationFeatures: universalInvitationFeatures,
    capabilities: intimateCapabilities,
  },
  signature: {
    key: "signature",
    label: "Signature",
    description: "Pilihan seimbang untuk undangan yang lengkap.",
    recommended: true,
    limits: { maxEvents: 3, maxGalleryImages: 20, maxSponsors: 5 },
    invitationFeatures: signatureInvitationFeatures,
    capabilities: signatureCapabilities,
  },
  grand: {
    key: "grand",
    label: "Grand",
    description: "Paket lengkap untuk pengalaman undangan terbaik.",
    recommended: false,
    limits: { maxEvents: 5, maxGalleryImages: 40, maxSponsors: 10 },
    invitationFeatures: grandInvitationFeatures,
    capabilities: grandCapabilities,
  },
};

export function isPackageKey(value: unknown): value is PackageKey {
  return typeof value === "string" && (PACKAGE_KEYS as readonly string[]).includes(value);
}

export function isPackageUpgrade(current: PackageKey, target: PackageKey): boolean {
  if (!isPackageKey(current) || !isPackageKey(target)) return false;
  return PACKAGE_KEYS.indexOf(target) > PACKAGE_KEYS.indexOf(current);
}

export function isPackageDowngrade(current: PackageKey, target: PackageKey): boolean {
  if (!isPackageKey(current) || !isPackageKey(target)) return false;
  return PACKAGE_KEYS.indexOf(target) < PACKAGE_KEYS.indexOf(current);
}

export function getPackageDefinition(packageKey: PackageKey): PackageDefinition {
  return PACKAGE_DEFINITIONS[packageKey];
}

export function getDefaultInvitationFeatures(packageKey: PackageKey): InvitationFeatures {
  const definition = getPackageDefinition(packageKey);
  const defaults = {} as InvitationFeatures;

  for (const key of INVITATION_FEATURE_KEYS) {
    const optionalDefault = key === "story" || key === "wishes";
    defaults[key] = Boolean(
      definition.invitationFeatures[key] && (universalInvitationFeatures[key] || optionalDefault),
    );
  }

  return defaults;
}

export function resolveEffectiveInvitationFeatures(
  packageKey: PackageKey,
  requested: InvitationFeatures,
): InvitationFeatures {
  const allowed = getPackageDefinition(packageKey).invitationFeatures;
  const effective = {} as InvitationFeatures;

  for (const key of INVITATION_FEATURE_KEYS) {
    effective[key] = Boolean(requested[key] && allowed[key]);
  }

  return effective;
}

export function getRequiredPackageForFeature(
  feature: PackageCapability,
): PackageKey | undefined {
  for (const packageKey of PACKAGE_KEYS) {
    const definition = getPackageDefinition(packageKey);
    const invitationFeature = Object.prototype.hasOwnProperty.call(
      definition.invitationFeatures,
      feature,
    );
    const capability = Object.prototype.hasOwnProperty.call(definition.capabilities, feature);
    if ((invitationFeature && definition.invitationFeatures[feature as keyof InvitationFeatures]) ||
      (capability && definition.capabilities[feature as PackageCapabilities])) {
      return packageKey;
    }
  }

  return undefined;
}

export function validatePackageCapacity(
  packageKey: PackageKey,
  resource: PackageCapacityResource,
  currentCount: number,
  incomingCount: number,
): PackagePolicyError | null {
  const definition = getPackageDefinition(packageKey);
  const limit = resource === "events"
    ? definition.limits.maxEvents
    : definition.limits.maxGalleryImages;
  const total = currentCount + incomingCount;

  if (total <= limit) return null;

  if (resource === "events") {
    return {
      code: "PACKAGE_EVENT_LIMIT_REACHED",
      message: `Paket ${definition.label} mendukung maksimal ${limit} acara.`,
      packageKey,
      current: currentCount,
      limit,
    };
  }

  return {
    code: "PACKAGE_GALLERY_LIMIT_REACHED",
    message: `Paket ${definition.label} mendukung maksimal ${limit} foto galeri.`,
    packageKey,
    current: currentCount,
    limit,
  };
}

export function findPackageChangeConflicts(
  targetPackage: PackageKey,
  snapshot: InvitationPackageSnapshot,
): PackageChangeConflict[] {
  const conflicts: PackageChangeConflict[] = [];
  const eventError = validatePackageCapacity(targetPackage, "events", snapshot.eventCount, 0);
  if (eventError) conflicts.push({ kind: "events", ...eventError });

  const galleryError = validatePackageCapacity(targetPackage, "gallery", snapshot.galleryCount, 0);
  if (galleryError) conflicts.push({ kind: "gallery", ...galleryError });

  const allowed = getPackageDefinition(targetPackage).invitationFeatures;
  for (const feature of INVITATION_FEATURE_KEYS) {
    if (snapshot.enabledFeatures[feature] !== true || allowed[feature]) continue;
    conflicts.push({
      kind: "feature",
      code: "PACKAGE_DOWNGRADE_CONFLICT",
      message: `Fitur ${feature} tidak tersedia di paket ${getPackageDefinition(targetPackage).label}.`,
      packageKey: targetPackage,
      feature,
    });
  }

  return conflicts;
}
