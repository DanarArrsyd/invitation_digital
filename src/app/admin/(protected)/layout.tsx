import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logout } from "./actions";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-neutral-900">Invitation Admin</span>
          <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
            Dashboard
          </Link>
          <Link href="/admin/invitations" className="text-sm text-neutral-500 hover:text-neutral-900">
            Invitations
          </Link>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
