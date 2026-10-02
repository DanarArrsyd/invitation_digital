import { Badge } from "@/components/ui/badge";
import { effectiveInvitationStatus, type InvitationStatus } from "@/lib/invitations/status";

const STATUS: Record<
  InvitationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draf", variant: "secondary" },
  published: { label: "Terbit", variant: "default" },
  expired: { label: "Kedaluwarsa", variant: "destructive" },
  archived: { label: "Diarsipkan", variant: "outline" },
};

export function InvitationStatusBadge({
  status,
  expiresAt,
}: {
  status: string;
  expiresAt?: string | null;
}) {
  const { label, variant } = STATUS[effectiveInvitationStatus(status, expiresAt)];
  return <Badge variant={variant}>{label}</Badge>;
}
