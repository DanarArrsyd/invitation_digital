import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AnalyticsEventType =
  | "invitation_open"
  | "cover_opened"
  | "rsvp_submitted"
  | "wish_submitted";

/**
 * Best-effort only. The public experience must never break or slow down
 * because analytics failed — see ROADMAP.md Phase 6 section 8. Callers
 * fire-and-forget or await without checking the result.
 */
export async function trackEvent(input: {
  invitationId: string;
  eventType: AnalyticsEventType;
  sessionId: string | null;
  guestId?: string | null;
  metadata?: Record<string, string>;
}): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("analytics_events").insert({
      invitation_id: input.invitationId,
      event_type: input.eventType,
      session_id: input.sessionId,
      guest_id: input.guestId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Swallow — analytics must never break the public invitation.
  }
}
