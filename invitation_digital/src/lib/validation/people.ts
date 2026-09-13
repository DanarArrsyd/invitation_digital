import { z } from "zod";
import { normalizeInstagramProfile } from "@/lib/utils/instagram";

export const upsertPersonSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  invitationId: z.string().uuid(),
  role: z.string().trim().min(1, "Role wajib diisi").max(50),
  fullName: z.string().trim().min(1, "Nama wajib diisi").max(200),
  nickname: z.string().trim().max(100).optional().or(z.literal("")),
  fatherName: z.string().trim().max(200).optional().or(z.literal("")),
  motherName: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const deletePersonSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});

export const personInstagramSchema = z.object({
  invitationId: z.string().uuid(),
  personId: z.string().uuid(),
  instagram: z.string().trim().max(200).refine(
    (value) => value === "" || normalizeInstagramProfile(value) !== null,
    "Masukkan username atau URL profil Instagram yang valid.",
  ),
});
