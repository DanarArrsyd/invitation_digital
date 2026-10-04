import Link from "next/link";

import { formatEventDate } from "@/components/admin/format";
import { InvitationStatusBadge } from "@/components/admin/status-badge";
import type { DashboardInvitation } from "@/server/invitations/dashboard";

const QUICK_LINKS = [
  { section: "general", label: "Edit" },
  { section: "guests", label: "Tamu" },
  { section: "responses", label: "Respons" },
] as const;

export function RecentInvitations({ invitations }: { invitations: DashboardInvitation[] }) {
  return (
    <section aria-labelledby="recent-heading">
      <div className="flex items-end justify-between gap-4">
        <h2 id="recent-heading" className="text-lg font-semibold tracking-[-0.02em]">
          Terakhir diubah
        </h2>
        <Link href="/admin/invitations" className="text-sm font-medium text-[#3f5a45] underline-offset-4 hover:underline">
          Lihat semua
        </Link>
      </div>

      <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="grid grid-cols-1 gap-3 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-center md:gap-6"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/invitations/${invitation.id}/general`}
                  className="truncate font-medium hover:underline"
                  title={invitation.title}
                >
                  {invitation.title}
                </Link>
                <InvitationStatusBadge status={invitation.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {formatEventDate(invitation.eventDate)}
                {invitation.themeName ? `, tema ${invitation.themeName}` : ""}
              </p>
            </div>

            <dl className="flex gap-5 text-sm">
              {[
                { label: "Tamu", value: invitation.guestCount },
                { label: "RSVP", value: invitation.rsvpCount },
                { label: "Ucapan", value: invitation.wishCount },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-row-reverse items-baseline gap-1.5">
                  <dt className="text-muted-foreground">{stat.label}</dt>
                  <dd className="font-medium tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <nav aria-label={`Aksi cepat ${invitation.title}`} className="flex gap-1">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.section}
                  href={`/admin/invitations/${invitation.id}/${link.section}`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </li>
        ))}
      </ul>
    </section>
  );
}
