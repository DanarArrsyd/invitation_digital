import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Call after ANY invitation mutation (general/content/theme/features/people/
 * events/stories/gallery/gifts/guests/publish/unpublish).
 *
 * Three things can go stale otherwise:
 * - the shared [id]/layout.tsx (title/status badge) and the invitations
 *   list — a Server Action redirect back into a shared layout does not
 *   refetch it on its own;
 * - the public /[slug] route — it has no reason to know an admin edit
 *   happened unless told explicitly.
 *
 * Looking up the slug here (rather than requiring every call site to pass
 * it) means no edit path can forget to invalidate the public page.
 */
export async function revalidateInvitation(invitationId: string) {
  revalidatePath(`/admin/invitations/${invitationId}`, "layout");
  revalidatePath("/admin/invitations", "page");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("invitations")
    .select("slug")
    .eq("id", invitationId)
    .maybeSingle();

  if (data?.slug) {
    revalidatePath(`/${data.slug}`);
  }
}
