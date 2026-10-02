import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteGiftAccountAction, upsertGiftAccountAction } from "./actions";

type GiftDefaults = {
  provider_type: string;
  provider_name: string;
  account_number: string;
  account_name: string;
};

/** Shared by the edit forms and the "add" form; `idPrefix` keeps ids unique per row. */
function GiftFields({ idPrefix, gift }: { idPrefix: string; gift?: GiftDefaults }) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <FormField id={id("providerType")} label="Jenis">
        <Input id={id("providerType")} name="providerType" defaultValue={gift?.provider_type ?? "bank"} placeholder="bank / e-wallet" />
      </FormField>
      <FormField id={id("providerName")} label="Nama bank / e-wallet">
        <Input id={id("providerName")} name="providerName" defaultValue={gift?.provider_name ?? ""} required />
      </FormField>
      <FormField id={id("accountNumber")} label="Nomor rekening">
        <Input
          id={id("accountNumber")}
          name="accountNumber"
          autoComplete="off"
          defaultValue={gift?.account_number ?? ""}
          required
        />
      </FormField>
      <FormField id={id("accountName")} label="Atas nama">
        <Input id={id("accountName")} name="accountName" defaultValue={gift?.account_name ?? ""} required />
      </FormField>
    </>
  );
}

export default async function GiftsPage({
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

  const { invitation, gifts } = detail;

  return (
    <div className="flex flex-col gap-6">
      <FormMessage tone="error">{error}</FormMessage>

      {gifts.map((gift) => (
        <section key={gift.id} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-sm font-medium text-foreground">
              {gift.provider_name} · {gift.account_name}
            </h2>
            <ConfirmDeleteForm
              action={deleteGiftAccountAction}
              hiddenFields={{ id: gift.id, invitationId: invitation.id }}
              title="Hapus rekening ini?"
              description={`Rekening ${gift.provider_name} a.n. ${gift.account_name} akan hilang dari undangan. Tindakan ini tidak bisa dibatalkan.`}
            />
          </div>

          <form action={upsertGiftAccountAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={gift.id} />
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={gift.sort_order} />

            <GiftFields idPrefix={`gift-${gift.id}`} gift={gift} />

            <SubmitButton className="w-fit sm:col-span-2">Simpan</SubmitButton>
          </form>
        </section>
      ))}

      <form
        action={upsertGiftAccountAction}
        className="grid max-w-lg gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={gifts.length} />

        <GiftFields idPrefix="gift-new" />

        <SubmitButton className="w-fit sm:col-span-2" pendingText="Menambahkan...">
          Tambah rekening
        </SubmitButton>
      </form>
    </div>
  );
}
