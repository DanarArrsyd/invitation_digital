import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseHexColorList } from "@/lib/utils/dressCode";
import type { Json } from "@/types/database";

function record(value: Json | undefined): { [key: string]: Json | undefined } {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

/** Optional presentation metadata lives in the existing invitation settings JSON, same as personSocials. */
export async function updateDressCode(input: {
  invitationId: string;
  description: string;
  group1Label: string;
  group1Colors: string;
  group2Label: string;
  group2Colors: string;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login kembali." };

  const { data: current, error: readError } = await supabase
    .from("invitations")
    .select("settings, updated_at")
    .eq("id", input.invitationId)
    .maybeSingle();
  if (readError || !current) return { error: "Undangan tidak dapat dimuat." };

  const groups = [
    { label: input.group1Label.trim(), colors: parseHexColorList(input.group1Colors) },
    { label: input.group2Label.trim(), colors: parseHexColorList(input.group2Colors) },
  ].filter((g) => g.label && g.colors.length > 0);

  const description = input.description.trim();
  const settings = record(current.settings);
  const dressCode = { description: description || null, groups };

  const { data: saved, error } = await supabase
    .from("invitations")
    .update({ settings: { ...settings, dressCode } })
    .eq("id", input.invitationId)
    .eq("updated_at", current.updated_at)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Dress code gagal disimpan. Silakan coba lagi." };
  if (!saved) return { error: "Data berubah. Muat ulang halaman lalu simpan kembali." };
  return null;
}
