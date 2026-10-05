import { ExternalLink, Eye, ImageOff } from "lucide-react";
import Link from "next/link";

import { eventCountdownLabel, formatEventDate } from "@/components/admin/format";
import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { InvitationListItem } from "@/server/invitations/queries";

/** Column template shared by the list header and every row (lg and up). */
export const INVITATION_LIST_COLUMNS =
  "lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_7.5rem]";

const iconAction =
  "relative z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

/**
 * One invitation in the admin list. The whole row opens the editor; the
 * preview and live-link icons sit above that link.
 */
export function InvitationListRow({ invitation }: { invitation: InvitationListItem }) {
  const coverUrl = getMediaPublicUrl(
    invitation.cover_image_path ?? invitation.gallery_items[0]?.image_path ?? null,
  );
  const isLive = effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published";
  const guests = invitation.guests[0]?.count ?? 0;
  const rsvps = invitation.rsvps[0]?.count ?? 0;
  const wishes = invitation.wishes[0]?.count ?? 0;
  const countdown = eventCountdownLabel(invitation.event_date);
  const soon = countdown?.startsWith("H-") && Number(countdown.slice(2)) <= 14;
  const packageLabel = PACKAGE_DEFINITIONS[invitation.package_key as PackageKey]?.label ?? null;
  const rsvpShare = guests > 0 ? Math.min(100, Math.round((rsvps / guests) * 100)) : 0;

  return (
    <li
      className={cn(
        "group relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[color-mix(in_oklch,var(--card),var(--muted)_35%)] sm:px-5 lg:gap-x-5",
        INVITATION_LIST_COLUMNS,
      )}
    >
      {/* Identity */}
      <div className="col-span-2 flex min-w-0 items-center gap-3.5 lg:col-span-1">
        <div className="aspect-[3/4] w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff aria-hidden="true" className="size-4" />
              <span className="sr-only">Belum ada foto</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/admin/invitations/${invitation.id}/general`}
            className="block truncate font-semibold tracking-[-0.01em] text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-none focus-visible:after:ring-3 focus-visible:after:ring-ring/25 focus-visible:after:ring-inset"
            title={invitation.title}
          >
            {invitation.title}
          </Link>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">/{invitation.slug}</p>
        </div>
      </div>

      {/* Status + actions: top-right on phones, last column on desktop */}
      <div className="col-start-3 row-start-1 flex items-center justify-end gap-1 lg:order-last lg:col-start-auto lg:row-start-auto">
        <InvitationStatusBadge status={invitation.status} expiresAt={invitation.expires_at} className="mr-1" />
        <Link
          href={`/admin/invitations/${invitation.id}/preview`}
          target="_blank"
          className={cn(iconAction, "hidden sm:flex")}
          title="Pratinjau"
        >
          <Eye aria-hidden="true" className="size-4" />
          <span className="sr-only">Pratinjau {invitation.title} (tab baru)</span>
        </Link>
        {isLive ? (
          <Link
            href={buildPublishedInvitationPath({ slug: invitation.slug, publishedAt: invitation.published_at })}
            target="_blank"
            className={cn(iconAction, "hidden sm:flex")}
            title="Buka undangan"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">Buka {invitation.title} (tab baru)</span>
          </Link>
        ) : null}
      </div>

      {/* Event */}
      <div className="col-span-3 min-w-0 pl-[3.625rem] text-sm lg:col-span-1 lg:pl-0">
        <p className="truncate font-medium text-foreground">{formatEventDate(invitation.event_date)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {countdown ? <span className={cn(soon && "font-medium text-[#8a5a12]")}>{countdown}</span> : null}
          {countdown && invitation.venue_summary ? " · " : null}
          {invitation.venue_summary}
        </p>
      </div>

      {/* Theme and package */}
      <div className="col-span-3 hidden min-w-0 flex-wrap gap-1.5 lg:col-span-1 lg:flex">
        {invitation.theme?.name ? (
          <span className="truncate rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {invitation.theme.name}
          </span>
        ) : null}
        {packageLabel ? (
          <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {packageLabel}
          </span>
        ) : null}
      </div>

      {/* Responses */}
      <div className="col-span-3 flex min-w-0 flex-col gap-1.5 pl-[3.625rem] lg:col-span-1 lg:pl-0">
        <p className="flex justify-between gap-2 text-xs whitespace-nowrap text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground tabular-nums">{rsvps}</span>/{guests} RSVP
          </span>
          <span>
            <span className="font-semibold text-foreground tabular-nums">{wishes}</span> ucapan
          </span>
        </p>
        <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <span className="block h-full rounded-full bg-[var(--tr-sage)]" style={{ width: `${rsvpShare}%` }} />
        </span>
      </div>
    </li>
  );
}
