import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import {
  deleteGalleryItemAction,
  updateGalleryItemAction,
  uploadGalleryItemAction,
} from "./actions";

export default async function GalleryPage({
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

  const { invitation, gallery } = detail;

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <p className="text-sm text-neutral-500">
        {gallery.length} photo{gallery.length === 1 ? "" : "s"} (target: 8 for pilot)
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-lg border border-neutral-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMediaPublicUrl(item.image_path) ?? undefined}
              alt={item.alt_text ?? ""}
              className="aspect-square w-full rounded-md object-cover"
            />

            <form action={updateGalleryItemAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="invitationId" value={invitation.id} />
              <input type="hidden" name="imagePath" value={item.image_path} />
              <Input name="caption" placeholder="Caption" defaultValue={item.caption ?? ""} />
              <Input name="altText" placeholder="Alt text" defaultValue={item.alt_text ?? ""} />
              <Input
                name="sortOrder"
                type="number"
                defaultValue={item.sort_order}
                className="w-20"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                <Button
                  type="submit"
                  formAction={deleteGalleryItemAction}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </form>
          </div>
        ))}
      </div>

      <form
        action={uploadGalleryItemAction}
        className="flex max-w-md flex-col gap-3 rounded-lg border border-dashed border-neutral-300 p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />

        <div className="flex flex-col gap-2">
          <Label>Photo</Label>
          <Input type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Caption</Label>
          <Input name="caption" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Alt text</Label>
          <Input name="altText" />
        </div>

        <Button type="submit" className="w-fit">
          Upload
        </Button>
      </form>
    </div>
  );
}
