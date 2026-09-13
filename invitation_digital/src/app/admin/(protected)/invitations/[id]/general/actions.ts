"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateGeneralSchema } from "@/lib/validation/invitation";
import { updateInvitationGeneral } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

export async function updateGeneralAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = updateGeneralSchema.safeParse({
    invitationId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    themeId: formData.get("themeId"),
    eventDate: formData.get("eventDate"),
    venueSummary: formData.get("venueSummary"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/invitations/${invitationId}/general?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
      )}`,
    );
  }

  // Capture the current slug in case this edit renames it — the old public
  // URL must stop resolving immediately, not linger from a stale cache.
  const supabase = await createSupabaseServerClient();
  const { data: before } = await supabase
    .from("invitations")
    .select("slug")
    .eq("id", parsed.data.invitationId)
    .maybeSingle();

  const result = await updateInvitationGeneral({
    invitationId: parsed.data.invitationId,
    title: parsed.data.title,
    slug: parsed.data.slug,
    type: parsed.data.type,
    themeId: parsed.data.themeId,
    eventDate: parsed.data.eventDate || null,
    venueSummary: parsed.data.venueSummary || null,
  });

  if (result?.error) {
    redirect(
      `/admin/invitations/${invitationId}/general?error=${encodeURIComponent(result.error)}`,
    );
  }

  if (before?.slug && before.slug !== parsed.data.slug) {
    revalidatePath(`/${before.slug}`);
  }
  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/general?saved=1`);
}
