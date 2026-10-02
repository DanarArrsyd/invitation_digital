import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import { PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { createSupabaseServerClient } from "@/lib/supabase/server";


/**
 * Editor header shared by every invitation section. Navigation between
 * sections lives in the app sidebar; this block answers "which invitation,
 * in what state" and holds the actions that apply to the whole invitation.
 */
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
    .select("id, title, slug, status, package_key, published_at, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) {
    notFound();
  }

  // Publishing happens on the Publikasi page, next to the readiness
  // checklist; the header only links there or opens the live invitation.
  const isLive = effectiveInvitationStatus(invitation.status, invitation.expires_at) === "published";
  const publicLink = isLive
    ? buildPublishedInvitationPath({ slug: invitation.slug, publishedAt: invitation.published_at })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/admin/invitations" className="hover:text-foreground">
              Undangan
            </Link>
          </nav>
          <h1 className="mt-1 truncate text-xl font-semibold text-foreground" title={invitation.title}>
            {invitation.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <InvitationStatusBadge status={invitation.status} expiresAt={invitation.expires_at} />
            <Badge variant="outline">
              Paket {PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].label}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/invitations/${id}/preview`}
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Preview
            <ExternalLink aria-hidden="true" />
            <span className="sr-only">(tab baru)</span>
          </Link>

          {isLive && publicLink ? (
            <Link href={publicLink} target="_blank" className={buttonVariants({ size: "sm" })}>
              Buka undangan
              <span className="sr-only">(tab baru)</span>
            </Link>
          ) : (
            <Link href={`/admin/invitations/${id}/publish`} className={buttonVariants({ size: "sm" })}>
              {invitation.status === "published" ? "Status publikasi" : "Terbitkan…"}
            </Link>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
