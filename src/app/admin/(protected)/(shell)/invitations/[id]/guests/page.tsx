import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { EmptyState } from "@/components/admin/empty-state";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
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
import { MAX_GUESTS_PER_SUBMIT } from "@/lib/validation/guests";
import { getInvitationDetail, getInvitationResponses } from "@/server/invitations/queries";

import { createGuestsAction, deleteGuestAction } from "./actions";
import { CopyLinkButton } from "./CopyLinkButton";

const RSVP_LABEL = {
  attending: { label: "Hadir", variant: "default" },
  not_attending: { label: "Tidak hadir", variant: "secondary" },
} as const;

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { id } = await params;
  const { error, q = "" } = await searchParams;

  const [detail, responses] = await Promise.all([getInvitationDetail(id), getInvitationResponses(id)]);
  if (!detail) notFound();

  const { invitation, guests } = detail;

  // RSVPs from a personal link carry the guest id; one per guest (upserted).
  const rsvpByGuest = new Map(
    responses.rsvps.filter((rsvp) => rsvp.guest_id).map((rsvp) => [rsvp.guest_id, rsvp.attendance]),
  );
  const query = q.trim().toLocaleLowerCase("id-ID");
  const visibleGuests = query
    ? guests.filter((guest) =>
        `${guest.display_name} ${guest.notes ?? ""}`.toLocaleLowerCase("id-ID").includes(query),
      )
    : guests;
  const responded = guests.filter((guest) => rsvpByGuest.has(guest.id)).length;

  return (
    <div className="flex flex-col gap-8">
      <FormMessage tone="error">{error}</FormMessage>

      <section className="max-w-2xl">
        <h2 className="text-sm font-semibold text-foreground">Tambah tamu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tempel daftar nama, satu per baris (maks. {MAX_GUESTS_PER_SUBMIT}). Nama yang sudah ada dilewati,
          dan setiap tamu mendapat link personal sendiri.
        </p>
        <form action={createGuestsAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="invitationId" value={invitation.id} />
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
          <SubmitButton className="w-fit" pendingText="Menambahkan...">
            Tambah tamu
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Daftar tamu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {guests.length} tamu · {responded} sudah RSVP lewat link personal
            </p>
          </div>
          {guests.length > 0 ? (
            <form role="search" className="flex items-center gap-2">
              <label htmlFor="guest-search" className="sr-only">
                Cari tamu
              </label>
              <Input
                id="guest-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Cari nama atau catatan"
                className="w-56"
              />
              {query ? (
                <Link href={`/admin/invitations/${invitation.id}/guests`} className="text-sm text-muted-foreground hover:text-foreground">
                  Reset
                </Link>
              ) : null}
            </form>
          ) : null}
        </div>

        {guests.length === 0 ? (
          <EmptyState
            title="Belum ada tamu"
            description="Tambahkan nama tamu di atas untuk membuat link undangan personal."
          />
        ) : visibleGuests.length === 0 ? (
          <EmptyState title={`Tidak ada tamu yang cocok dengan "${q}"`} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Link personal</TableHead>
                  <TableHead className="text-right">
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
                      <TableCell className="max-w-64">
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
                          <code className="max-w-56 truncate text-xs text-muted-foreground" title={link}>
                            {link}
                          </code>
                          <CopyLinkButton link={link} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
    </div>
  );
}
