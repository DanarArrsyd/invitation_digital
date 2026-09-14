import { z } from "zod";

import { GALLERY_ASPECT_RATIOS } from "@/types/invitation";

const GALLERY_ASPECT_RATIO_VALUES = GALLERY_ASPECT_RATIOS.map((r) => r.value) as [
  string,
  ...string[],
];

export const updateGalleryRatioSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
  aspectRatio: z.enum(GALLERY_ASPECT_RATIO_VALUES, {
    message: "Rasio foto tidak valid",
  }),
});

export const reorderGalleryItemsSchema = z.object({
  invitationId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1, "Urutan foto tidak valid"),
});
