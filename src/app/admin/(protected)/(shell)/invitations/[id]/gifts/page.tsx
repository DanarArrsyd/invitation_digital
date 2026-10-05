import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import {
  FieldGrid,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  SettingsSection,
} from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
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
    <div className="flex flex-col">
      <FormMessage tone="error" className="mb-2">{error}</FormMessage>

      <SettingsSection
        id="gifts"
        title="Rekening hadiah"
        description="Tampil di bagian Tanda Kasih dengan tombol salin nomor. Bisa rekening bank atau dompet digital."
      >
        {gifts.map((gift, index) => (
          <Panel key={gift.id}>
            <PanelHeader
              index={index + 1}
              title={gift.provider_name}
              meta={`a.n. ${gift.account_name} · ${gift.account_number}`}
              actions={
                <ConfirmDeleteForm
                  action={deleteGiftAccountAction}
                  hiddenFields={{ id: gift.id, invitationId: invitation.id }}
                  title="Hapus rekening ini?"
                  description={`Rekening ${gift.provider_name} a.n. ${gift.account_name} akan hilang dari undangan. Tindakan ini tidak bisa dibatalkan.`}
                />
              }
            />
            <form action={upsertGiftAccountAction}>
              <input type="hidden" name="id" value={gift.id} />
              <input type="hidden" name="invitationId" value={invitation.id} />
              <input type="hidden" name="sortOrder" value={gift.sort_order} />
              <PanelBody>
                <FieldGrid>
                  <GiftFields idPrefix={`gift-${gift.id}`} gift={gift} />
                </FieldGrid>
              </PanelBody>
              <PanelFooter>
                <UnsavedHint />
                <SubmitButton>Simpan rekening</SubmitButton>
              </PanelFooter>
            </form>
          </Panel>
        ))}

        <Panel className="border-dashed bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] shadow-none">
          <PanelHeader title="Tambah rekening" meta={`Rekening ke-${gifts.length + 1}`} />
          <form action={upsertGiftAccountAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={gifts.length} />
            <PanelBody>
              <FieldGrid>
                <GiftFields idPrefix="gift-new" />
              </FieldGrid>
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Menambahkan...">Tambah rekening</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
