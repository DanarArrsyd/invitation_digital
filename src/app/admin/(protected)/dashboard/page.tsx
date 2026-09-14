import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSummary } from "@/server/invitations/dashboard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default async function AdminDashboardPage() {
  const { counts, expiringSoon } = await getDashboardSummary();

  const metrics = [
    { label: "Total", value: counts.total },
    { label: "Draft", value: counts.draft },
    { label: "Published", value: counts.published },
    { label: "Expired", value: counts.expired },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan seluruh invitation.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="gap-1">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Perlu perhatian — expired dalam 14 hari
        </h2>

        {expiringSoon.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Tidak ada invitation yang akan expired"
            description="Invitation published yang mendekati masa expired (≤14 hari) akan muncul di sini."
          />
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {expiringSoon.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex-row items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Expired {formatDate(item.expiresAt)}</p>
                  </div>
                  <Link
                    href={`/admin/invitations/${item.id}/publish`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Kelola
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Link href="/admin/invitations" className={`${buttonVariants({ variant: "outline" })} w-fit`}>
        Lihat semua invitations
      </Link>
    </div>
  );
}
