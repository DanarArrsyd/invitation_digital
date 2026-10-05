import { z } from "zod";

export const publicRsvpSchema = z.object({
  invitationId: z.string({ message: "Undangan tidak dikenali." }).uuid("Undangan tidak dikenali."),
  guestToken: z.string().trim().optional().or(z.literal("")),
  guestName: z.string().trim().min(1, "Nama wajib diisi").max(150).optional().or(z.literal("")),
  attendance: z.enum(["attending", "not_attending"], {
    message: "Pilih salah satu kehadiran",
  }),
  // Checked after the demo short-circuit (demos never write, so they need no
  // proof); a real invitation without a token gets TURNSTILE_PENDING_MESSAGE.
  turnstileToken: z.string().optional().default(""),
});

/** Shown when a real invitation's form is sent before Turnstile finished. */
export const TURNSTILE_PENDING_MESSAGE = "Verifikasi keamanan belum selesai. Tunggu sebentar, lalu kirim lagi.";
