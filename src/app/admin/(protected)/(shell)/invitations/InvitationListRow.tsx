import { ExternalLink, ImageOff } from "lucide-react";
import Link from "next/link";

import { formatEventDate } from "@/components/admin/format";
import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { InvitationListItem } from "@/server/invitations/queries";

/** One invitation in the admin list: cover, identity, response counts, actions. */
export function InvitationListRow({ invitation }: { invitation: InvitationListItem }) {
  const coverUrl = getMediaPublicUrl(
    invitation.cover_image_path ?? invitation.gallery_items[0]?.image_path ?? null,
  );
  const isLive = effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published";
  const stats = [
    { label: "Tamu", value: invitation.guests[0]?.count ?? 0 },
    { label: "RSVP", value: invitation.rsvps[0]?.count ?? 0 },
    { label: "Ucapan", value: invitation.wishes[0]?.count ?? 0 },
  ];

  return (
    <li
      className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-border p-4 last:border-b-0 sm:px-5 lg:grid-cols-[4.5rem_minmax(0,1fr)_14rem_15rem] lg:items-center lg:gap-x-6"
    >
      <div className="row-span-2 aspect-[3/4] w-16 overflow-hidden rounded-lg bg-muted lg:row-span-1 lg:w-[4.5rem]">
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
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/invitations/${invitation.id}/general`}
            className="truncate font-medium hover:underline"
            title={invitation.title}
          >
            {invitation.title}
          </Link>
          <InvitationStatusBadge status={invitation.status} expiresAt={invitation.expires_at} />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">/{invitation.slug}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {formatEventDate(invitation.event_date)}
          {invitation.theme?.name ? `, tema ${invitation.theme.name}` : ""}
        </p>
      </div>

      <dl className="col-start-2 flex gap-5 text-sm lg:col-start-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-row-reverse items-baseline gap-1.5">
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="font-medium tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1 lg:justify-end">
        <Link
          href={`/admin/invitations/${invitation.id}/general`}
          className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-lg px-3")}
        >
          Kelola
        </Link>
        <Link
          href={`/admin/invitations/${invitation.id}/preview`}
          target="_blank"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg px-3")}
        >
          Pratinjau
          <span className="sr-only">(tab baru)</span>
        </Link>
        {isLive ? (
          <Link
            href={buildPublishedInvitationPath({
              slug: invitation.slug,
              publishedAt: invitation.published_at,
            })}
            target="_blank"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 rounded-lg px-3")}
          >
            Buka
            <ExternalLink aria-hidden="true" />
            <span className="sr-only">undangan (tab baru)</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}
