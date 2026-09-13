import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listInvitations } from "@/server/invitations/queries";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  expired: "outline",
  archived: "outline",
};

export default async function InvitationsListPage() {
  const invitations = await listInvitations();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Invitations</h1>
        <Link href="/admin/invitations/new" className={buttonVariants()}>
          New Invitation
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Event date</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-neutral-500">
                  No invitations yet.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invitation.status] ?? "outline"}>
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invitation.event_date ?? "—"}</TableCell>
                  <TableCell>{invitation.theme?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/invitations/${invitation.id}/general`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
