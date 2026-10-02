export const INVITATION_STATUSES = ["draft", "published", "expired", "archived"] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

/**
 * Status as guests experience it. A `published` invitation whose
 * `expires_at` has passed is already served as expired by the public
 * loader, so admin surfaces (badges, counts, filters) report it as expired
 * too instead of echoing the stored column.
 */
export function effectiveInvitationStatus(
  status: string,
  expiresAt: string | null | undefined,
  now: number = Date.now(),
): InvitationStatus {
  if (status === "published" && expiresAt && new Date(expiresAt).getTime() <= now) {
    return "expired";
  }
  return (INVITATION_STATUSES as readonly string[]).includes(status)
    ? (status as InvitationStatus)
    : "draft";
}
