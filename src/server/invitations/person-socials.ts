import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeInstagramProfile } from "@/lib/utils/instagram";
import type { Json } from "@/types/database";

function record(value: Json | undefined): { [key: string]: Json | undefined } {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

/** Optional presentation metadata uses the existing invitation settings JSON. */
export async function updatePersonInstagram(input: {
  invitationId: string;
  personId: string;
  instagram: string;
}): Promise<{ error: string } | null> {
  const profile = normalizeInstagramProfile(input.instagram);
  if (input.instagram.trim() && !profile) return { error: "Masukkan username atau URL profil Instagram yang valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login kembali." };

  const { data: person, error: personError } = await supabase
    .from("invitation_people")
    .select("id")
    .eq("id", input.personId)
    .eq("invitation_id", input.invitationId)
    .maybeSingle();
  if (personError || !person) return { error: "Profil tidak ditemukan pada undangan ini." };

  const { data: current, error: readError } = await supabase
    .from("invitations")
    .select("settings, updated_at")
    .eq("id", input.invitationId)
    .maybeSingle();
  if (readError || !current) return { error: "Undangan tidak dapat dimuat." };

  const settings = record(current.settings);
  const socials = record(settings.personSocials);
  const personSocials = { ...record(socials[input.personId]) };
  if (profile) personSocials.instagram = profile.url;
  else delete personSocials.instagram;

  const { data: saved, error } = await supabase
    .from("invitations")
    .update({ settings: { ...settings, personSocials: { ...socials, [input.personId]: personSocials } } })
    .eq("id", input.invitationId)
    .eq("updated_at", current.updated_at)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Instagram gagal disimpan. Silakan coba lagi." };
  if (!saved) return { error: "Data berubah. Muat ulang halaman lalu simpan kembali." };
  return null;
}
