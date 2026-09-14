import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { listInvitations } from "@/server/invitations/queries";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  expired: "outline",
  archived: "outline",
};

export default async function InvitationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const invitations = await listInvitations(status);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Invitations</h1>
        <Link href="/admin/invitations/new" className={buttonVariants()}>
          New Invitation
        </Link>
      </div>

      <div className="mt-4 flex gap-1 border-b border-border">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin/invitations" : `/admin/invitations?status=${filter.value}`}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
              status === filter.value && "border-b-2 border-primary text-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {invitations.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Belum ada invitation"
          description="Buat invitation pertama untuk mulai mengatur tema, konten, dan tamu."
          action={
            <Link href="/admin/invitations/new" className={buttonVariants({ size: "sm" })}>
              Buat invitation pertama
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((invitation) => {
            const coverPath = invitation.gallery_items[0]?.image_path ?? null;
            const coverUrl = getMediaPublicUrl(coverPath);

            return (
              <Card key={invitation.id} className="overflow-hidden">
                <div className="aspect-[16/10] w-full bg-muted">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Belum ada foto
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{invitation.title}</p>
                    <Badge variant={STATUS_VARIANT[invitation.status] ?? "outline"}>
                      {invitation.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {invitation.event_date ?? "Tanggal belum diatur"} · {invitation.theme?.name ?? "—"}
                  </p>
                </CardContent>
                <CardFooter className="justify-between gap-2 bg-transparent">
                  <Link
                    href={`/admin/invitations/${invitation.id}/general`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/invitations/${invitation.id}/preview`}
                      target="_blank"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Preview
                    </Link>
                    {invitation.status === "published" ? (
                      <Link
                        href={`/${invitation.slug}`}
                        target="_blank"
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Buka link
                      </Link>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
