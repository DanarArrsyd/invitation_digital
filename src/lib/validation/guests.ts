import { z } from "zod";

export const MAX_GUESTS_PER_SUBMIT = 500;

/**
 * One name per line. Blank lines and repeats inside the pasted list are
 * dropped here (case-insensitive); skipping names that already exist on the
 * invitation happens in the mutation, which can see the stored guests.
 */
export function parseGuestNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const name = line.trim().replace(/\s+/g, " ");
    const key = name.toLocaleLowerCase("id-ID");
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export const createGuestsSchema = z.object({
  invitationId: z.string().uuid(),
  names: z
    .array(z.string().max(200, "Nama tamu maksimal 200 karakter"))
    .min(1, "Isi minimal satu nama tamu")
    .max(MAX_GUESTS_PER_SUBMIT, `Maksimal ${MAX_GUESTS_PER_SUBMIT} nama sekali kirim`),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const deleteGuestSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});
