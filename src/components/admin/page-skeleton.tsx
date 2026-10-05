import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder shown while an admin page streams in. The sidebar and header
 * stay put, so navigation responds the moment a link is clicked.
 */
export function AdminPageSkeleton({ withHeader = true }: { withHeader?: boolean }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat halaman">
      {withHeader ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
