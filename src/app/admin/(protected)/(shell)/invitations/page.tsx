import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listInvitations } from "@/server/invitations/queries";

import { InvitationListRow } from "./InvitationListRow";

export const metadata: Metadata = {
  title: "Undangan",
};

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draf" },
  { value: "published", label: "Terbit" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "demo", label: "Demo" },
] as const;

function filterHref(status: string, search: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (search) params.set("q", search);
  const query = params.toString();
  return query ? `/admin/invitations?${query}` : "/admin/invitations";
}

export default async function InvitationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q = "" } = await searchParams;
  const search = q.trim();
  const invitations = await listInvitations(status, search);
  const isFiltered = status !== "all" || search !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Undangan"
        description="Cari, saring, dan buka undangan untuk dikelola."
        actions={
          <Link href="/admin/invitations/new" className={cn(buttonVariants(), "h-10 rounded-xl px-4")}>
            <Plus aria-hidden="true" />
            Undangan baru
          </Link>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Filter status" className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = status === filter.value;
            return (
              <Link
                key={filter.value}
                href={filterHref(filter.value, search)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                  isActive && "bg-card text-foreground shadow-[0_1px_2px_rgba(23,32,27,0.08)]",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <form action="/admin/invitations" role="search" className="relative md:w-72">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="invitation-search" className="sr-only">
            Cari undangan
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="invitation-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Cari judul atau slug"
            className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </form>
      </div>

      {invitations.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="Tidak ada undangan yang cocok"
            description="Coba kata kunci lain atau ganti filter status."
            action={
              <Link href="/admin/invitations" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Hapus filter
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="Belum ada undangan"
            description="Buat undangan pertama untuk mulai mengatur tema, konten, dan tamu."
            action={
              <Link href="/admin/invitations/new" className={buttonVariants({ size: "sm" })}>
                Buat undangan pertama
              </Link>
            }
          />
        )
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {invitations.map((invitation) => (
            <InvitationListRow key={invitation.id} invitation={invitation} />
          ))}
        </ul>
      )}
    </div>
  );
}
