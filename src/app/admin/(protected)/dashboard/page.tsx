import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage invitations from here.</p>
      <Link href="/admin/invitations" className={`${buttonVariants()} mt-4`}>
        View Invitations
      </Link>
    </div>
  );
}
