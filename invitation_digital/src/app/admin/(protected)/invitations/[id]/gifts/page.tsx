import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteGiftAccountAction, upsertGiftAccountAction } from "./actions";

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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {gifts.map((gift) => (
        <form
          key={gift.id}
          action={upsertGiftAccountAction}
          className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <input type="hidden" name="id" value={gift.id} />
          <input type="hidden" name="invitationId" value={invitation.id} />
          <input type="hidden" name="sortOrder" value={gift.sort_order} />

          <div className="flex flex-col gap-2">
            <Label>Provider type</Label>
            <Input name="providerType" defaultValue={gift.provider_type} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bank / provider name</Label>
            <Input name="providerName" defaultValue={gift.provider_name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Account number</Label>
            <Input name="accountNumber" defaultValue={gift.account_number} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Account name</Label>
            <Input name="accountName" defaultValue={gift.account_name} required />
          </div>

          <div className="col-span-2 flex gap-2">
            <Button type="submit" className="w-fit">
              Save
            </Button>
            <Button
              type="submit"
              formAction={deleteGiftAccountAction}
              variant="destructive"
              className="w-fit"
            >
              Delete
            </Button>
          </div>
        </form>
      ))}

      <form
        action={upsertGiftAccountAction}
        className="grid max-w-lg grid-cols-2 gap-3 rounded-lg border border-dashed border-neutral-300 p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={gifts.length} />

        <div className="flex flex-col gap-2">
          <Label>Provider type</Label>
          <Input name="providerType" defaultValue="bank" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Bank / provider name</Label>
          <Input name="providerName" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Account number</Label>
          <Input name="accountNumber" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Account name</Label>
          <Input name="accountName" required />
        </div>

        <Button type="submit" className="col-span-2 w-fit">
          Add gift account
        </Button>
      </form>
    </div>
  );
}
