import type { InvitationType } from "@/types/invitation";

/** Admin-facing names for the stored invitation `type` values. */
export const INVITATION_TYPE_LABELS: Record<InvitationType, string> = {
  wedding: "Pernikahan",
  birthday: "Ulang tahun",
  engagement: "Lamaran / tunangan",
  aqiqah: "Aqiqah",
  graduation: "Wisuda",
  corporate: "Acara perusahaan",
};

export const INVITATION_TYPES = Object.keys(INVITATION_TYPE_LABELS) as InvitationType[];

export function invitationTypeLabel(value: string): string {
  return INVITATION_TYPE_LABELS[value as InvitationType] ?? value;
}
