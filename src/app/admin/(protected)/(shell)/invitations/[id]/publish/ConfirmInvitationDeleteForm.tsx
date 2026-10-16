"use client";

import { useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConfirmInvitationDeleteForm({
  action,
  invitationId,
  slug,
}: {
  action: (formData: FormData) => void | Promise<void>;
  invitationId: string;
  slug: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmation, setConfirmation] = useState("");

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="confirmationSlug" value={confirmation} />
      <AlertDialog>
        <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
          Hapus undangan
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus undangan permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Data undangan, tamu, RSVP, ucapan, statistik, dan file media akan dihapus.
              Tindakan ini tidak bisa dibatalkan. Ketik slug <strong>{slug}</strong> untuk melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label htmlFor="delete-invitation-slug" className="text-sm font-medium">
            Konfirmasi slug
          </label>
          <Input
            id="delete-invitation-slug"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={confirmation !== slug}
              onClick={() => formRef.current?.requestSubmit()}
            >
              Ya, hapus permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
