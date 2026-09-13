"use server";

import { revalidatePath } from "next/cache";

import { getSessionId } from "@/lib/analytics/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEvent } from "@/server/public/analytics";
import { submitRsvp as submitRsvpDomain } from "@/server/public/rsvp";
import { submitWish as submitWishDomain } from "@/server/public/wishes";

/** FormData.get() returns null for a missing field; Zod's .optional() only
 * accepts undefined, so normalize before validation. */
function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

/**
 * Fire-and-forget from CoverGate's "Buka Undangan" click — best-effort,
 * never awaited by the caller so it can't delay the opening animation.
 */
export async function trackCoverOpenedAction(invitationId: string, guestToken: string | null) {
  const supabase = createSupabaseAdminClient();

  let guestId: string | null = null;
  if (guestToken) {
    const { data: guest } = await supabase
      .from("guests")
      .select("id")
      .eq("invitation_id", invitationId)
      .eq("token", guestToken)
      .maybeSingle();
    guestId = guest?.id ?? null;
  }

  const sessionId = await getSessionId();

  await trackEvent({
    invitationId,
    eventType: "cover_opened",
    sessionId,
    guestId,
  });
}

export interface RsvpFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitRsvpAction(
  _prevState: RsvpFormState,
  formData: FormData,
): Promise<RsvpFormState> {
  const result = await submitRsvpDomain({
    invitationId: field(formData, "invitationId"),
    guestToken: field(formData, "guestToken"),
    guestName: field(formData, "guestName"),
    attendance: field(formData, "attendance"),
    turnstileToken: field(formData, "cf-turnstile-response"),
  });

  if (!result.ok) {
    return { status: "error", message: result.error ?? "Terjadi kesalahan." };
  }

  const slug = field(formData, "slug");
  if (slug) revalidatePath(`/${slug}`);

  return { status: "success" };
}

export interface WishFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitWishAction(
  _prevState: WishFormState,
  formData: FormData,
): Promise<WishFormState> {
  const result = await submitWishDomain({
    invitationId: field(formData, "invitationId"),
    guestToken: field(formData, "guestToken"),
    guestName: field(formData, "guestName"),
    message: field(formData, "message"),
    turnstileToken: field(formData, "cf-turnstile-response"),
  });

  if (!result.ok) {
    return { status: "error", message: result.error ?? "Terjadi kesalahan." };
  }

  const slug = field(formData, "slug");
  if (slug) revalidatePath(`/${slug}`);

  return { status: "success" };
}
