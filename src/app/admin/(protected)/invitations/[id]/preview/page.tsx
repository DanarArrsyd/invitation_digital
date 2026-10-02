import { notFound } from "next/navigation";

import { getInvitationPreview } from "@/server/invitations/preview";
import "@/themes/theme-fonts";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

/**
 * Lives outside the (shell) route group on purpose: the theme renders
 * full-bleed exactly as guests see it, without the admin sidebar or editor
 * header. The parent (protected) layout still requires a session.
 */
export default async function InvitationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invitation = await getInvitationPreview(id);
  if (!invitation) notFound();

  return (
    <div>
      {/* Above the theme's fixed cover (z-50) so the mode stays visible. */}
      <div className="sticky top-0 z-[60] bg-primary px-4 py-1.5 text-center text-xs tracking-wide text-primary-foreground">
        {invitation.status === "published"
          ? "Mode pratinjau — tampilan sama dengan yang dilihat tamu"
          : "Mode pratinjau — belum terlihat oleh tamu sampai diterbitkan"}
      </div>
      <ThemeRenderer invitation={invitation} guest={null} />
    </div>
  );
}
