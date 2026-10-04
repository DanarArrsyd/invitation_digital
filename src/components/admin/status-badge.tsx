import { Badge } from "@/components/ui/badge";
import { effectiveInvitationStatus, type InvitationStatus } from "@/lib/invitations/status";
import { cn } from "@/lib/utils";

const STATUS: Record<InvitationStatus, { label: string; className: string }> = {
  draft: { label: "Draf", className: "border-[#e4d7b4] bg-[#f6efdc] text-[#6a5220]" },
  published: { label: "Terbit", className: "border-[#c9d8c4] bg-[#e3ede0] text-[#24452b]" },
  expired: { label: "Kedaluwarsa", className: "border-[#ecc9bf] bg-[#f7e3dd] text-[#8a3324]" },
  archived: { label: "Diarsipkan", className: "border-border bg-transparent text-muted-foreground" },
};

export function InvitationStatusBadge({
  status,
  expiresAt,
  className,
}: {
  status: string;
  expiresAt?: string | null;
  className?: string;
}) {
  const { label, className: tone } = STATUS[effectiveInvitationStatus(status, expiresAt)];
  return (
    <Badge variant="outline" className={cn(tone, className)}>
      {label}
    </Badge>
  );
}
