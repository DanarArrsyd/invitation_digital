import { notFound } from "next/navigation";

import { getInvitationPreview } from "@/server/invitations/preview";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

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
      <div className="sticky top-0 z-50 bg-neutral-900 py-1.5 text-center text-xs tracking-wide text-white">
        Preview Mode — not visible to guests until published
      </div>
      <ThemeRenderer invitation={invitation} guest={null} />
    </div>
  );
}
