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
import { getInvitationAnalyticsSummary, getInvitationResponses } from "@/server/invitations/queries";

import { deleteWishAction, hideWishAction, unhideWishAction } from "./actions";
import { DeleteWishButton } from "./DeleteWishButton";

export default async function ResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [{ rsvps, wishes }, analytics] = await Promise.all([
    getInvitationResponses(id),
    getInvitationAnalyticsSummary(id),
  ]);
  const attending = rsvps.filter((r) => r.attendance === "attending").length;
  const notAttending = rsvps.filter((r) => r.attendance === "not_attending").length;

  const metrics = [
    { label: "Total Opens", value: analytics.totalOpens },
    { label: "Unique Visitors", value: analytics.uniqueVisitors },
    { label: "Cover Opened", value: analytics.coverOpened },
    { label: "RSVP Total", value: rsvps.length },
    { label: "Hadir", value: attending },
    { label: "Tidak Hadir", value: notAttending },
    { label: "Wishes", value: wishes.length },
  ];

  return (
    <div className="flex flex-col gap-10">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Overview</h2>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <p className="text-xs text-neutral-500">{metric.label}</p>
              <p className="text-xl font-semibold text-neutral-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">RSVP</h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
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
                  <TableCell colSpan={3} className="text-center text-sm text-neutral-500">
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
        <h2 className="text-sm font-semibold text-neutral-900">Wishes</h2>

        <div className="mt-4 flex flex-col gap-3">
          {wishes.length === 0 ? (
            <p className="text-sm text-neutral-500">No wishes yet.</p>
          ) : (
            wishes.map((wish) => (
              <div
                key={wish.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">{wish.guest_name}</p>
                    <Badge variant={wish.is_visible ? "default" : "secondary"}>
                      {wish.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{wish.message}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(wish.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {wish.is_visible ? (
                    <form action={hideWishAction}>
                      <input type="hidden" name="id" value={wish.id} />
                      <input type="hidden" name="invitationId" value={id} />
                      <Button type="submit" variant="outline" size="sm">
                        Hide
                      </Button>
                    </form>
                  ) : (
                    <form action={unhideWishAction}>
                      <input type="hidden" name="id" value={wish.id} />
                      <input type="hidden" name="invitationId" value={id} />
                      <Button type="submit" variant="outline" size="sm">
                        Unhide
                      </Button>
                    </form>
                  )}

                  <form action={deleteWishAction}>
                    <input type="hidden" name="id" value={wish.id} />
                    <input type="hidden" name="invitationId" value={id} />
                    <DeleteWishButton />
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
