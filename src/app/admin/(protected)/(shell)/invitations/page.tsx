import { ArrowDownWideNarrow, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  countInvitationsByStatus,
  listInvitations,
  type InvitationSort,
  type InvitationStatusCounts,
} from "@/server/invitations/queries";

import { INVITATION_LIST_COLUMNS, InvitationListRow } from "./InvitationListRow";

export const metadata: Metadata = {
  title: "Undangan",
};

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draf" },
  { value: "published", label: "Terbit" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "demo", label: "Demo" },
] as const satisfies readonly { value: keyof InvitationStatusCounts; label: string }[];

const SORTS = [
  { value: "recent", label: "Terbaru dibuat" },
  { value: "event", label: "Acara terdekat" },
] as const satisfies readonly { value: InvitationSort; label: string }[];

function listHref(status: string, search: string, sort: InvitationSort): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (search) params.set("q", search);
  if (sort !== "recent") params.set("sort", sort);
  const query = params.toString();
  return query ? `/admin/invitations?${query}` : "/admin/invitations";
}

export default async function InvitationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>;
}) {
  const { status = "all", q = "", sort: sortParam } = await searchParams;
  const search = q.trim();
  const sort: InvitationSort = sortParam === "event" ? "event" : "recent";
  const [invitations, counts] = await Promise.all([listInvitations(status, search, sort), countInvitationsByStatus()]);
  const isFiltered = status !== "all" || search !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Undangan"
        description={`${counts.all} undangan pelanggan · ${counts.published} terbit · ${counts.draft} draf`}
        actions={
          <Link href="/admin/invitations/new" className={buttonVariants({ size: "lg" })}>
            <Plus aria-hidden="true" />
            Undangan baru
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <nav aria-label="Filter status" className="-mx-1 flex gap-0.5 overflow-x-auto rounded-xl bg-muted p-1 lg:mx-0">
          {STATUS_FILTERS.map((filter) => {
            const isActive = status === filter.value;
            return (
              <Link
                key={filter.value}
                href={listHref(filter.value, search, sort)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                  isActive && "bg-card text-foreground shadow-[0_1px_2px_rgba(23,32,27,0.08)]",
                )}
              >
                {filter.label}
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{counts[filter.value]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <form action="/admin/invitations" role="search" className="relative sm:flex-1 lg:max-w-72">
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            {sort !== "recent" ? <input type="hidden" name="sort" value={sort} /> : null}
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
              className="h-10 w-full rounded-[10px] border border-input bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
            />
          </form>

          <nav aria-label="Urutkan" className="flex items-center gap-1 text-sm">
            <ArrowDownWideNarrow aria-hidden="true" className="mr-1 size-4 text-muted-foreground" />
            {SORTS.map((option) => {
              const isActive = sort === option.value;
              return (
                <Link
                  key={option.value}
                  href={listHref(status, search, option.value)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex h-8 items-center rounded-lg px-2.5 font-medium text-muted-foreground transition hover:text-foreground",
                    isActive && "bg-card text-foreground ring-1 ring-border",
                  )}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(23,32,27,0.04)]">
          <div
            aria-hidden="true"
            className={cn(
              "hidden gap-x-5 border-b border-border bg-[color-mix(in_oklch,var(--card),var(--muted)_40%)] px-5 py-2.5 text-xs font-medium text-muted-foreground lg:grid",
              INVITATION_LIST_COLUMNS,
            )}
          >
            <span>Undangan</span>
            <span>Acara</span>
            <span>Tema &amp; paket</span>
            <span>Respons</span>
            <span className="text-right">Status</span>
          </div>
          <ul>
            {invitations.map((invitation) => (
              <InvitationListRow key={invitation.id} invitation={invitation} />
            ))}
          </ul>
        </div>
      )}

      {invitations.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {invitations.length} undangan ditampilkan · klik baris untuk mengelola
        </p>
      ) : null}
    </div>
  );
}
