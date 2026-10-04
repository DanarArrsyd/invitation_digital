import type { PersonRole } from "@/types/invitation";

export const PERSON_ROLES = ["bride", "groom", "celebrant", "host", "speaker"] as const satisfies readonly PersonRole[];

export const PERSON_ROLE_LABELS: Record<PersonRole, string> = {
  bride: "Mempelai wanita",
  groom: "Mempelai pria",
  celebrant: "Yang dirayakan",
  host: "Tuan rumah",
  speaker: "Pembicara",
};

/**
 * Roles used to be typed by hand, so stored rows can read "Groom" or
 * " bride". Themes compare exact keys; this folds those spellings back.
 */
export function normalizePersonRole(value: string): string {
  return value.trim().toLowerCase();
}

export function isPersonRole(value: string): value is PersonRole {
  return (PERSON_ROLES as readonly string[]).includes(value);
}
