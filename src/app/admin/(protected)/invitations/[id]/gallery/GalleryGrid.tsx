"use client";

import { useState, useTransition } from "react";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reorderIds } from "@/lib/utils/gallery-order";
import { GALLERY_ASPECT_RATIOS, type GalleryAspectRatio } from "@/types/invitation";

import {
  deleteGalleryItemAction,
  reorderGalleryItemsAction,
  updateGalleryItemAction,
  updateGalleryItemRatioAction,
} from "./actions";

export interface GalleryGridItem {
  id: string;
  imageUrl: string;
  imagePath: string;
  caption: string | null;
  altText: string | null;
  aspectRatio: GalleryAspectRatio;
}

export function GalleryGrid({
  invitationId,
  items,
}: {
  invitationId: string;
  items: GalleryGridItem[];
}) {
  const [order, setOrder] = useState(items.map((item) => item.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const byId = new Map(items.map((item) => [item.id, item]));
  const orderedItems = order.map((id) => byId.get(id)).filter((item): item is GalleryGridItem => Boolean(item));

  function commitOrder(nextOrder: string[]) {
    setOrder(nextOrder);
    startTransition(() => {
      const formData = new FormData();
      formData.set("invitationId", invitationId);
      formData.set("orderedIds", nextOrder.join(","));
      reorderGalleryItemsAction(formData);
    });
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = order.indexOf(draggingId);
    const toIndex = order.indexOf(targetId);
    commitOrder(reorderIds(order, fromIndex, toIndex));
    setDraggingId(null);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orderedItems.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDraggingId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(item.id)}
          className="cursor-grab rounded-lg border border-border bg-card p-3 active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.altText ?? item.caption ?? ""}
            className="aspect-square w-full rounded-md object-cover"
          />

          <div className="mt-3 flex flex-col gap-2">
            <Label>Rasio foto</Label>
            <Select
              defaultValue={item.aspectRatio}
              onValueChange={(value) => {
                if (!value) return;
                startTransition(() => {
                  const formData = new FormData();
                  formData.set("invitationId", invitationId);
                  formData.set("id", item.id);
                  formData.set("aspectRatio", value);
                  updateGalleryItemRatioAction(formData);
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form action={updateGalleryItemAction} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="invitationId" value={invitationId} />
            <Input name="caption" placeholder="Caption" defaultValue={item.caption ?? ""} />
            <Input name="altText" placeholder="Alt text" defaultValue={item.altText ?? ""} />
            <div className="flex justify-between gap-2">
              <SubmitButton variant="outline" size="sm" pendingText="Menyimpan...">
                Simpan caption
              </SubmitButton>
              <ConfirmDeleteForm
                action={deleteGalleryItemAction}
                hiddenFields={{ id: item.id, invitationId, imagePath: item.imagePath }}
                title="Hapus foto ini?"
                description="Foto akan hilang permanen dari galeri undangan. Tindakan ini tidak bisa dibatalkan."
              />
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
