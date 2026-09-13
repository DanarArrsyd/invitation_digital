import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminTabs } from "./AdminTabs";
import { publishAction, unpublishAction } from "./publish/actions";

export default async function InvitationEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, title, status")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">{invitation.title}</h1>
          <Badge variant={invitation.status === "published" ? "default" : "secondary"}>
            {invitation.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/invitations/${id}/preview`}
            target="_blank"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Preview
          </Link>

          {invitation.status === "published" ? (
            <form action={unpublishAction}>
              <input type="hidden" name="invitationId" value={id} />
              <Button type="submit" variant="outline" size="sm">
                Unpublish
              </Button>
            </form>
          ) : (
            <form action={publishAction}>
              <input type="hidden" name="invitationId" value={id} />
              <Button type="submit" size="sm">
                Publish
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-4">
        <AdminTabs invitationId={id} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
