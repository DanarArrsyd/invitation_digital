import { z } from "zod";

import { EVENT_TYPES } from "@/lib/marketing/event-types";
import { normalizeWhatsAppNumber } from "@/lib/marketing/whatsapp";
import { PACKAGE_KEYS } from "@/lib/packages/entitlements";

const MAX_PRICE_IDR = 100_000_000;

/** "Rp 149.000", "149.000", "149000" → 149000; empty → null ("Tanya harga"). */
const priceSchema = z
  .string()
  .trim()
  .transform((value, context) => {
    if (value === "") return null;
    const digits = value.replace(/^rp\.?\s*/i, "").replace(/[.\s]/g, "");
    if (!/^[0-9]+$/.test(digits)) {
      context.addIssue({ code: "custom", message: "Harga hanya boleh angka, contoh 149000" });
      return z.NEVER;
    }
    const amount = Number(digits);
    if (amount > MAX_PRICE_IDR) {
      context.addIssue({ code: "custom", message: "Harga terlalu besar" });
      return z.NEVER;
    }
    return amount;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .transform((value) => (value === "" ? null : value));

export const packageOfferSchema = z.object({
  packageKey: z.enum(PACKAGE_KEYS),
  price: priceSchema,
  priceNote: optionalText(40),
  isVisible: z.boolean(),
});

export const siteContactSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .transform((value, context) => {
      if (value === "") return null;
      const normalized = normalizeWhatsAppNumber(value);
      if (!normalized) {
        context.addIssue({ code: "custom", message: "Nomor WhatsApp tidak valid, contoh 0812 3456 7890" });
        return z.NEVER;
      }
      return normalized;
    }),
  whatsappMessage: z.string().trim().min(1, "Isi pesan wajib diisi").max(500, "Maksimal 500 karakter"),
  instagramUrl: z
    .string()
    .trim()
    .transform((value, context) => {
      if (value === "") return null;
      const handle = value.match(/^@?([A-Za-z0-9._]{1,30})$/)?.[1];
      if (handle) return `https://www.instagram.com/${handle}/`;
      try {
        const url = new URL(value);
        if (url.protocol === "https:" && /(^|\.)instagram\.com$/.test(url.hostname)) return url.toString();
      } catch {
        // fall through to the error below
      }
      context.addIssue({ code: "custom", message: "Isi dengan @username atau link instagram.com" });
      return z.NEVER;
    }),
});

export const themeCatalogueSchema = z.object({
  themeId: z.string().uuid(),
  isListed: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  tagline: optionalText(120),
  description: optionalText(600),
  eventTypes: z.array(z.enum(EVENT_TYPES)).min(1, "Pilih minimal satu jenis acara"),
});

export const themeDemoSchema = z.object({
  themeId: z.string().uuid(),
  /** Empty = this template has no demo. */
  invitationId: z.union([z.string().uuid(), z.literal("")]),
});

export const themeScreenshotSchema = z.object({
  themeId: z.string().uuid(),
  path: z.string().min(1),
});
