import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
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
      <FormMessage tone="error">{error}</FormMessage>

      <form action={createGuestAction} className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <FormField id="guest-displayName" label="Guest name" className="flex-1">
          <Input id="guest-displayName" name="displayName" required />
        </FormField>
        <FormField id="guest-notes" label="Notes" className="flex-1">
          <Input id="guest-notes" name="notes" />
        </FormField>
        <SubmitButton className="w-fit" pendingText="Menambahkan...">
          Add guest
        </SubmitButton>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  No guests yet.
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => {
                const link = buildPublishedInvitationPath({
                  slug: invitation.slug,
                  publishedAt: invitation.published_at,
                  guestToken: guest.token,
                });
                return (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.display_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">{link}</code>
                        <CopyLinkButton link={link} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmDeleteForm
                        action={deleteGuestAction}
                        hiddenFields={{ id: guest.id, invitationId: invitation.id }}
                        title="Hapus tamu ini?"
                        description={`Link personal untuk ${guest.display_name} akan berhenti berfungsi, termasuk yang sudah terkirim. Tindakan ini tidak bisa dibatalkan.`}
                        triggerLabel="Delete"
                      />
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
