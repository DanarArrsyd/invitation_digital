import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { getInvitationAnalyticsSummary, getInvitationDetail, getInvitationResponses } from "@/server/invitations/queries";

import { deleteWishAction, hideWishAction, unhideWishAction } from "./actions";

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
  const attending = rsvps.filter((r) => r.attendance === "attending").length;
  const notAttending = rsvps.filter((r) => r.attendance === "not_attending").length;

  const metrics = [
    ...(analytics ? [
      { label: "Total Opens", value: analytics.totalOpens },
      { label: "Unique Visitors", value: analytics.uniqueVisitors },
      { label: "Cover Opened", value: analytics.coverOpened },
    ] : []),
    { label: "RSVP Total", value: rsvps.length },
    { label: "Hadir", value: attending },
    { label: "Tidak Hadir", value: notAttending },
    { label: "Wishes", value: wishes.length },
  ];

  return (
    <div className="flex flex-col gap-10">
      <FormMessage tone="error">{error}</FormMessage>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Overview</h2>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-xl font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
        {!analytics ? (
          <div className="mt-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Visitor analytics tersedia di Grand
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">RSVP</h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No RSVP yet.
                  </TableCell>
                </TableRow>
              ) : (
                rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell className="font-medium">{rsvp.guest_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={rsvp.attendance === "attending" ? "default" : "secondary"}>
                        {rsvp.attendance === "attending" ? "Hadir" : "Tidak Hadir"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(rsvp.created_at).toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold text-foreground">Wishes</h2>

        <div className="mt-4 flex flex-col gap-3">
          {wishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No wishes yet.</p>
          ) : (
            wishes.map((wish) => (
              <div
                key={wish.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{wish.guest_name}</p>
                    <Badge variant={wish.is_visible ? "default" : "secondary"}>
                      {wish.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm break-words whitespace-pre-line text-muted-foreground">{wish.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(wish.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {wish.is_visible ? (
                    <form action={hideWishAction}>
                      <input type="hidden" name="id" value={wish.id} />
                      <input type="hidden" name="invitationId" value={id} />
                      <SubmitButton variant="outline" size="sm">
                        Hide
                      </SubmitButton>
                    </form>
                  ) : (
                    <form action={unhideWishAction}>
                      <input type="hidden" name="id" value={wish.id} />
                      <input type="hidden" name="invitationId" value={id} />
                      <SubmitButton variant="outline" size="sm">
                        Unhide
                      </SubmitButton>
                    </form>
                  )}

                  <ConfirmDeleteForm
                    action={deleteWishAction}
                    hiddenFields={{ id: wish.id, invitationId: id }}
                    title="Hapus ucapan ini?"
                    description={`Ucapan dari ${wish.guest_name} akan dihapus permanen. Untuk menyembunyikannya dari tamu tanpa menghapus, pakai Hide.`}
                    triggerLabel="Delete"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
