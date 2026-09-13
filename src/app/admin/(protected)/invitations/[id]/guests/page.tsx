import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvitationDetail } from "@/server/invitations/queries";

import { createGuestAction, deleteGuestAction } from "./actions";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, guests } = detail;

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form action={createGuestAction} className="flex max-w-lg items-end gap-3">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="displayName">Guest name</Label>
          <Input id="displayName" name="displayName" required />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" />
        </div>
        <Button type="submit">Add guest</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-neutral-500">
                  No guests yet.
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => {
                const link = `/${invitation.slug}?guest=${guest.token}`;
                return (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.display_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-neutral-500">{link}</code>
                        <CopyLinkButton link={link} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={deleteGuestAction}>
                        <input type="hidden" name="id" value={guest.id} />
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
