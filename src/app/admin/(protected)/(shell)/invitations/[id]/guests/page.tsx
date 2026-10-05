import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { EmptyState } from "@/components/admin/empty-state";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { Panel, PanelBody, PanelFooter, SettingsSection } from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { cn } from "@/lib/utils";
import { MAX_GUESTS_PER_SUBMIT } from "@/lib/validation/guests";
import { getInvitationDetail, getInvitationResponses } from "@/server/invitations/queries";

import { createGuestsAction, deleteGuestAction } from "./actions";
import { CopyLinkButton } from "./CopyLinkButton";

const RSVP_LABEL = {
  attending: { label: "Hadir", variant: "default" },
  not_attending: { label: "Tidak hadir", variant: "secondary" },
} as const;

const RSVP_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum RSVP" },
  { value: "attending", label: "Hadir" },
  { value: "not_attending", label: "Tidak hadir" },
] as const;

type RsvpFilter = (typeof RSVP_FILTERS)[number]["value"];

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; q?: string; rsvp?: string }>;
}) {
  const { id } = await params;
  const { error, q = "", rsvp: rsvpParam } = await searchParams;
  const rsvpFilter: RsvpFilter = RSVP_FILTERS.some((filter) => filter.value === rsvpParam)
    ? (rsvpParam as RsvpFilter)
    : "all";

  const [detail, responses] = await Promise.all([getInvitationDetail(id), getInvitationResponses(id)]);
  if (!detail) notFound();

  const { invitation, guests } = detail;

  // RSVPs from a personal link carry the guest id; one per guest (upserted).
  const rsvpByGuest = new Map(
    responses.rsvps.filter((rsvp) => rsvp.guest_id).map((rsvp) => [rsvp.guest_id, rsvp.attendance]),
  );
  const query = q.trim().toLocaleLowerCase("id-ID");
  const matchesRsvp = (guestId: string) => {
    const attendance = rsvpByGuest.get(guestId);
    if (rsvpFilter === "pending") return !attendance;
    if (rsvpFilter === "attending" || rsvpFilter === "not_attending") return attendance === rsvpFilter;
    return true;
  };
  const visibleGuests = guests.filter(
    (guest) =>
      matchesRsvp(guest.id) &&
      (!query || `${guest.display_name} ${guest.notes ?? ""}`.toLocaleLowerCase("id-ID").includes(query)),
  );
  const responded = guests.filter((guest) => rsvpByGuest.has(guest.id)).length;
  const attending = guests.filter((guest) => rsvpByGuest.get(guest.id) === "attending").length;
  const notAttending = guests.filter((guest) => rsvpByGuest.get(guest.id) === "not_attending").length;
  const filterCounts: Record<RsvpFilter, number> = {
    all: guests.length,
    pending: guests.length - responded,
    attending,
    not_attending: notAttending,
  };
  const basePath = `/admin/invitations/${invitation.id}/guests`;
  const filterHref = (value: RsvpFilter) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("rsvp", value);
    if (q) params.set("q", q);
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };
  const stats = [
    { label: "Tamu", value: guests.length },
    {
      label: "Sudah RSVP",
      value: responded,
      note: guests.length > 0 ? `${Math.round((responded / guests.length) * 100)}%` : null,
    },
    { label: "Hadir", value: attending },
    { label: "Tidak hadir", value: notAttending },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FormMessage tone="error">{error}</FormMessage>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(23,32,27,0.04)]">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1.5 text-2xl font-semibold tracking-[-0.02em] tabular-nums">
              {stat.value}
              {stat.note ? <span className="text-xs font-medium text-muted-foreground">{stat.note}</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="guest-list-heading" className="flex flex-col gap-3">
        <h2 id="guest-list-heading" className="sr-only">
          Daftar tamu
        </h2>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav aria-label="Filter RSVP" className="-mx-1 flex gap-0.5 overflow-x-auto rounded-xl bg-muted p-1 lg:mx-0">
            {RSVP_FILTERS.map((filter) => {
              const isActive = rsvpFilter === filter.value;
              return (
                <Link
                  key={filter.value}
                  href={filterHref(filter.value)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                    isActive && "bg-card text-foreground shadow-[0_1px_2px_rgba(23,32,27,0.08)]",
                  )}
                >
                  {filter.label}
                  <span className="font-mono text-[11px] tabular-nums">{filterCounts[filter.value]}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            {guests.length > 0 ? (
              <form role="search" className="relative sm:flex-1 lg:max-w-64">
                {rsvpFilter !== "all" ? <input type="hidden" name="rsvp" value={rsvpFilter} /> : null}
                <label htmlFor="guest-search" className="sr-only">
                  Cari tamu
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input id="guest-search" name="q" type="search" defaultValue={q} placeholder="Cari nama atau catatan" className="pl-9" />
              </form>
            ) : null}
            {query ? (
              <Link href={rsvpFilter === "all" ? basePath : `${basePath}?rsvp=${rsvpFilter}`} className="text-sm text-muted-foreground hover:text-foreground">
                Reset
              </Link>
            ) : null}
            <Link href="#add-guests" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              Tambah tamu
            </Link>
          </div>
        </div>

        {guests.length === 0 ? (
          <EmptyState
            title="Belum ada tamu"
            description="Tambahkan nama tamu di bawah untuk membuat link undangan personal."
          />
        ) : visibleGuests.length === 0 ? (
          <EmptyState title={query ? `Tidak ada tamu yang cocok dengan "${q}"` : "Tidak ada tamu di filter ini"} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(23,32,27,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[color-mix(in_oklch,var(--card),var(--muted)_40%)] hover:bg-[color-mix(in_oklch,var(--card),var(--muted)_40%)]">
                  <TableHead className="pl-5">Nama</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Link personal</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleGuests.map((guest) => {
                  const link = buildPublishedInvitationPath({
                    slug: invitation.slug,
                    publishedAt: invitation.published_at,
                    guestToken: guest.token,
                  });
                  const attendance = rsvpByGuest.get(guest.id);
                  const rsvp = attendance ? RSVP_LABEL[attendance as keyof typeof RSVP_LABEL] : null;
                  return (
                    <TableRow key={guest.id}>
                      <TableCell className="max-w-64 py-3 pl-5">
                        <p className="truncate font-medium" title={guest.display_name}>
                          {guest.display_name}
                        </p>
                        {guest.notes ? (
                          <p className="truncate text-xs text-muted-foreground" title={guest.notes}>
                            {guest.notes}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {rsvp ? (
                          <Badge variant={rsvp.variant}>{rsvp.label}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Belum</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="max-w-56 truncate font-mono text-xs text-muted-foreground" title={link}>
                            {link}
                          </code>
                          <CopyLinkButton link={link} />
                        </div>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <ConfirmDeleteForm
                          action={deleteGuestAction}
                          hiddenFields={{ id: guest.id, invitationId: invitation.id }}
                          title="Hapus tamu ini?"
                          description={`Link personal untuk ${guest.display_name} akan berhenti berfungsi, termasuk yang sudah terkirim. Tindakan ini tidak bisa dibatalkan.`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <SettingsSection
        id="add-guests"
        title="Tambah tamu"
        description={`Tempel daftar nama, satu per baris (maks. ${MAX_GUESTS_PER_SUBMIT}). Nama yang sudah ada dilewati, dan setiap tamu mendapat link personal sendiri.`}
        className="scroll-mt-20 border-t pt-8"
      >
        <Panel>
          <form action={createGuestsAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <PanelBody>
              <FormField id="guest-names" label="Nama tamu">
                <Textarea
                  id="guest-names"
                  name="names"
                  rows={6}
                  required
                  placeholder={"Bapak Ahmad Fauzi & keluarga\nIbu Sari Wulandari\nRizky Pratama"}
                />
              </FormField>
              <FormField
                id="guest-notes"
                label="Catatan (opsional)"
                hint="Berlaku untuk semua nama di atas, mis. Keluarga mempelai pria. Tidak tampil ke tamu."
              >
                <Input id="guest-notes" name="notes" maxLength={300} />
              </FormField>
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Menambahkan...">Tambah tamu</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
