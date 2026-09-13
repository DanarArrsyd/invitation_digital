import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminSidebar } from "./AdminSidebar";
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
    <SidebarProvider>
      <AdminSidebar invitationId={id} />
      <SidebarInset>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Link href="/admin/invitations" className="text-sm text-muted-foreground hover:text-foreground">
              Invitations
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold text-foreground">{invitation.title}</h1>
            <Badge variant={invitation.status === "published" ? "default" : "secondary"}>
              {invitation.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/invitations/${id}/preview`}
              target="_blank"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
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

        <div className="px-6 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
