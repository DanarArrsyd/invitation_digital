import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getInvitationDetail } from "@/server/invitations/queries";

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

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <p>
          Status: <span className="font-medium">{invitation.status}</span>
        </p>
        <p>Published at: {formatDateTime(invitation.published_at)}</p>
        <p>Expires at: {formatDateTime(invitation.expires_at)}</p>
        {isPublished ? (
          <p>
            Public URL:{" "}
            <Link
              href={`/${invitation.slug}`}
              target="_blank"
              className="text-neutral-900 underline underline-offset-2"
            >
              /{invitation.slug}
            </Link>
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
