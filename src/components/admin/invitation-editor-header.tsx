import { ChevronLeft, ExternalLink, Eye, ImageOff } from "lucide-react";
import Link from "next/link";

import { eventCountdownLabel, formatLongEventDate } from "@/components/admin/format";
import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Answers "which invitation, in what state, how ready" above every editor
 * section and holds the actions for the whole invitation. `publicLink` is
 * set only while the invitation is live.
 */
export function InvitationEditorHeader({
  invitationId,
  title,
  slug,
  status,
  expiresAt,
  eventDate,
  packageLabel,
  themeName,
  coverUrl,
  readiness,
  publicLink,
}: {
  invitationId: string;
  title: string;
  slug: string;
  status: string;
  expiresAt: string | null;
  eventDate: string | null;
  packageLabel: string;
  themeName: string | null;
  coverUrl: string | null;
  readiness: { done: number; total: number; missing: string[] };
  publicLink: string | null;
}) {
  const longDate = formatLongEventDate(eventDate);
  const countdown = eventCountdownLabel(eventDate);
  const percent = readiness.total > 0 ? Math.round((readiness.done / readiness.total) * 100) : 100;
  const complete = readiness.done === readiness.total;

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Navigasi" className="text-sm text-muted-foreground">
        <Link href="/admin/invitations" className="inline-flex items-center gap-1 rounded-md hover:text-foreground">
          <ChevronLeft aria-hidden="true" className="size-4" />
          Semua undangan
        </Link>
      </nav>

      <div className="grid gap-5 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(23,32,27,0.04)] sm:grid-cols-[auto_minmax(0,1fr)] sm:p-5 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center">
        <div className="hidden aspect-[3/4] w-16 overflow-hidden rounded-[10px] bg-muted sm:block">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff aria-hidden="true" className="size-4" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <InvitationStatusBadge status={status} expiresAt={expiresAt} />
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {packageLabel}
            </span>
            {themeName ? (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {themeName}
              </span>
            ) : null}
            <span className="truncate font-mono text-xs text-muted-foreground">/{slug}</span>
          </div>
          <h1 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.025em] break-words text-foreground sm:text-[1.375rem]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {longDate ? (
              <>
                {longDate}
                {countdown ? <span className="font-medium text-foreground"> · {countdown}</span> : null}
              </>
            ) : (
              "Tanggal acara belum diatur"
            )}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between xl:col-span-1 xl:justify-end">
          <Link
            href={`/admin/invitations/${invitationId}/publish`}
            className="group flex min-w-0 flex-col gap-1.5 rounded-lg sm:w-52"
            title={complete ? undefined : `Belum lengkap: ${readiness.missing.join(", ")}`}
          >
            <span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>Kesiapan terbit</span>
              <span className="font-medium text-foreground tabular-nums">
                {readiness.done}/{readiness.total}
              </span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span
                className={cn("block h-full rounded-full", complete ? "bg-[#2f6b45]" : "bg-[var(--tr-brass)]")}
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="truncate text-xs text-muted-foreground group-hover:text-foreground">
              {complete ? "Semua bagian lengkap" : `Kurang: ${readiness.missing.join(", ")}`}
            </span>
          </Link>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/admin/invitations/${invitationId}/preview`}
              target="_blank"
              className={buttonVariants({ variant: "outline" })}
            >
              <Eye aria-hidden="true" />
              Pratinjau
              <span className="sr-only">(tab baru)</span>
            </Link>

            {publicLink ? (
              <Link href={publicLink} target="_blank" className={buttonVariants()}>
                Buka undangan
                <ExternalLink aria-hidden="true" />
                <span className="sr-only">(tab baru)</span>
              </Link>
            ) : (
              <Link href={`/admin/invitations/${invitationId}/publish`} className={buttonVariants()}>
                {status === "published" ? "Status publikasi" : "Terbitkan…"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
