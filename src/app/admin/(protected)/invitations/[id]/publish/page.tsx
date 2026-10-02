import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { getInvitationDetail } from "@/server/invitations/queries";

import { CopyLinkButton } from "../guests/CopyLinkButton";
import { publishAction, unpublishAction } from "./actions";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default async function PublishPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation } = detail;
  const isPublished = invitation.status === "published";
  const publicLink = isPublished
    ? buildPublishedInvitationPath({
        slug: invitation.slug,
        publishedAt: invitation.published_at,
      })
    : null;

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
        <p>
          Status: <span className="font-medium">{invitation.status}</span>
        </p>
        <p>Published at: {formatDateTime(invitation.published_at)}</p>
        <p>Expires at: {formatDateTime(invitation.expires_at)}</p>
        {publicLink ? (
          <div className="flex flex-wrap items-center gap-2">
            <span>Public URL:</span>
            <Link
              href={publicLink}
              target="_blank"
              className="text-foreground underline underline-offset-2"
            >
              {publicLink}
            </Link>
            <CopyLinkButton link={publicLink} />
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isPublished ? (
        <form action={unpublishAction} className="w-fit">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <Button type="submit" variant="outline">
            Unpublish
          </Button>
        </form>
      ) : (
        <form action={publishAction} className="w-fit">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <Button type="submit">Publish</Button>
        </form>
      )}
    </div>
  );
}
