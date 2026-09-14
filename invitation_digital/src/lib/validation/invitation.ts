import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const invitationTypeSchema = z.enum([
  "wedding",
  "birthday",
  "engagement",
  "aqiqah",
  "graduation",
  "corporate",
]);

export const createInvitationSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter")
    .max(80)
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  type: invitationTypeSchema,
  themeId: z.string().uuid("Theme wajib dipilih"),
});

export const updateGeneralSchema = z.object({
  invitationId: z.string().uuid(),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter")
    .max(80)
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  type: invitationTypeSchema,
  themeId: z.string().uuid("Theme wajib dipilih"),
  eventDate: z.string().trim().optional().or(z.literal("")),
  venueSummary: z.string().trim().max(300).optional().or(z.literal("")),
});

export const updateContentSchema = z.object({
  invitationId: z.string().uuid(),
  openingQuote: z.string().trim().max(1000).optional().or(z.literal("")),
  openingMessage: z.string().trim().max(2000).optional().or(z.literal("")),
  closingMessage: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const featuresSchema = z.object({
  music: z.boolean(),
  countdown: z.boolean(),
  maps: z.boolean(),
  story: z.boolean(),
  gallery: z.boolean(),
  dressCode: z.boolean(),
  livestream: z.boolean(),
  rsvp: z.boolean(),
  wishes: z.boolean(),
  gift: z.boolean(),
  guestPersonalization: z.boolean(),
});

export const updateFeaturesSchema = z.object({
  invitationId: z.string().uuid(),
  features: featuresSchema,
});

export const updateDressCodeSchema = z.object({
  invitationId: z.string().uuid(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  group1Label: z.string().trim().max(40).optional().or(z.literal("")),
  group1Colors: z.string().trim().max(200).optional().or(z.literal("")),
  group2Label: z.string().trim().max(40).optional().or(z.literal("")),
  group2Colors: z.string().trim().max(200).optional().or(z.literal("")),
});
