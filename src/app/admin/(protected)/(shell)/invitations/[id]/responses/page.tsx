import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { EmptyState } from "@/components/admin/empty-state";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRequiredPackageForFeature, PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { getInvitationAnalyticsSummary, getInvitationDetail, getInvitationResponses } from "@/server/invitations/queries";

import { deleteWishAction, hideWishAction, unhideWishAction } from "./actions";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

/** A row of figures with one label each; no card per number. */
function StatStrip({ title, stats }: { title: string; stats: { label: string; value: number }[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <dl className="mt-2 flex flex-wrap divide-x divide-border rounded-lg border border-border bg-card">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-28 flex-1 px-4 py-3">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="text-xl font-semibold text-foreground tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function ResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [{ rsvps, wishes }, detail] = await Promise.all([
    getInvitationResponses(id),
    getInvitationDetail(id),
  ]);
  if (!detail) notFound();
  const analytics = PACKAGE_DEFINITIONS[detail.invitation.package_key as PackageKey].capabilities.analytics
    ? await getInvitationAnalyticsSummary(id)
    : null;
  const analyticsPackage = getRequiredPackageForFeature("analytics");
  const attending = rsvps.filter((r) => r.attendance === "attending").length;
  const notAttending = rsvps.filter((r) => r.attendance === "not_attending").length;
  const hiddenWishes = wishes.filter((wish) => !wish.is_visible).length;

  return (
    <div className="flex flex-col gap-10">
      <FormMessage tone="error">{error}</FormMessage>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Ringkasan</h2>
        <StatStrip
          title="Respons tamu"
          stats={[
            { label: "RSVP masuk", value: rsvps.length },
            { label: "Hadir", value: attending },
            { label: "Tidak hadir", value: notAttending },
            { label: "Ucapan", value: wishes.length },
          ]}
        />
        {analytics ? (
          <StatStrip
            title="Kunjungan"
            stats={[
              { label: "Dibuka", value: analytics.totalOpens },
              { label: "Pengunjung unik", value: analytics.uniqueVisitors },
              { label: "Membuka cover", value: analytics.coverOpened },
            ]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Statistik kunjungan tersedia di {analyticsPackage ? PACKAGE_DEFINITIONS[analyticsPackage].label : "paket lebih tinggi"}.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">RSVP</h2>

        {rsvps.length === 0 ? (
          <EmptyState
            title="Belum ada RSVP"
            description="Konfirmasi kehadiran dari tamu akan muncul di sini begitu undangan diterbitkan dan dibagikan."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kehadiran</TableHead>
                  <TableHead>Dikirim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell className="font-medium">
                      {rsvp.guest_name ?? "—"}
                      {rsvp.guest_id ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">link personal</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rsvp.attendance === "attending" ? "default" : "secondary"}>
                        {rsvp.attendance === "attending" ? "Hadir" : "Tidak hadir"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(rsvp.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Ucapan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ucapan langsung tampil di undangan. Sembunyikan yang tidak pantas; hapus hanya jika perlu
            dihilangkan permanen.
            {hiddenWishes > 0 ? ` ${hiddenWishes} sedang disembunyikan.` : ""}
          </p>
        </div>

        {wishes.length === 0 ? (
          <EmptyState title="Belum ada ucapan" />
        ) : (
          <ul className="flex flex-col gap-3">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className={`flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between ${
                  wish.is_visible ? "bg-card" : "bg-muted/50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{wish.guest_name}</p>
                    {!wish.is_visible ? <Badge variant="outline">Disembunyikan</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm break-words whitespace-pre-line text-muted-foreground">{wish.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(wish.created_at)}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <form action={wish.is_visible ? hideWishAction : unhideWishAction}>
                    <input type="hidden" name="id" value={wish.id} />
                    <input type="hidden" name="invitationId" value={id} />
                    <SubmitButton variant="outline" size="sm">
                      {wish.is_visible ? "Sembunyikan" : "Tampilkan"}
                    </SubmitButton>
                  </form>

                  <ConfirmDeleteForm
                    action={deleteWishAction}
                    hiddenFields={{ id: wish.id, invitationId: id }}
                    title="Hapus ucapan ini?"
                    description={`Ucapan dari ${wish.guest_name} akan dihapus permanen. Untuk menyembunyikannya dari tamu tanpa menghapus, pakai Sembunyikan.`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
