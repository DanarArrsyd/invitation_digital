import { ChevronLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Answers "which invitation, in what state" above every editor section and
 * holds the actions that apply to the whole invitation. `publicLink` is set
 * only while the invitation is live.
 */
export function InvitationEditorHeader({
  invitationId,
  title,
  slug,
  status,
  expiresAt,
  packageLabel,
  publicLink,
}: {
  invitationId: string;
  title: string;
  slug: string;
  status: string;
  expiresAt: string | null;
  packageLabel: string;
  publicLink: string | null;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="min-w-0">
        <nav aria-label="Navigasi" className="text-sm text-muted-foreground">
          <Link href="/admin/invitations" className="inline-flex items-center gap-1 hover:text-foreground">
            <ChevronLeft aria-hidden="true" className="size-4" />
            Semua undangan
          </Link>
        </nav>
        <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.03em] break-words text-foreground">
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <InvitationStatusBadge status={status} expiresAt={expiresAt} />
          <Badge variant="outline">Paket {packageLabel}</Badge>
          <span className="truncate">/{slug}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link
          href={`/admin/invitations/${invitationId}/preview`}
          target="_blank"
          className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl px-4")}
        >
          Pratinjau
          <ExternalLink aria-hidden="true" />
          <span className="sr-only">(tab baru)</span>
        </Link>

        {publicLink ? (
          <Link href={publicLink} target="_blank" className={cn(buttonVariants(), "h-10 rounded-xl px-4")}>
            Buka undangan
            <span className="sr-only">(tab baru)</span>
          </Link>
        ) : (
          <Link
            href={`/admin/invitations/${invitationId}/publish`}
            className={cn(buttonVariants(), "h-10 rounded-xl px-4")}
          >
            {status === "published" ? "Status publikasi" : "Terbitkan…"}
          </Link>
        )}
      </div>
    </div>
  );
}
