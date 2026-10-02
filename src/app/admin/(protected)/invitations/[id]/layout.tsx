import Link from "next/link";
import { notFound } from "next/navigation";

import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
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
    .select("id, title, status, package_key, expires_at")
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
            <InvitationStatusBadge status={invitation.status} expiresAt={invitation.expires_at} />
            <Badge variant="secondary">
              {PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].label}
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
                <SubmitButton variant="outline" size="sm" pendingText="Memproses...">
                  Unpublish
                </SubmitButton>
              </form>
            ) : (
              <form action={publishAction}>
                <input type="hidden" name="invitationId" value={id} />
                <SubmitButton size="sm" pendingText="Menerbitkan...">
                  Publish
                </SubmitButton>
              </form>
            )}
          </div>
        </div>

        <div className="px-6 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
