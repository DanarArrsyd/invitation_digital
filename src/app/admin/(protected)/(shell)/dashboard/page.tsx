import type { Metadata } from "next";

import { getDashboardSummary } from "@/server/invitations/dashboard";

import { AttentionList } from "./AttentionList";
import { DashboardHero } from "./DashboardHero";
import { GettingStarted } from "./GettingStarted";
import { RecentInvitations } from "./RecentInvitations";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const { counts, totals, recent, attention } = await getDashboardSummary();

  return (
    <div className="flex flex-col gap-10">
      <DashboardHero counts={counts} totals={totals} />

      {counts.total === 0 ? (
        <GettingStarted />
      ) : (
        <>
          <AttentionList items={attention} />
          <RecentInvitations invitations={recent} />
        </>
      )}
    </div>
  );
}
