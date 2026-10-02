import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logout } from "../actions";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  // The parent layout already redirected signed-out visitors; this read is
  // only for showing who is signed in.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user?.email ?? null} logoutAction={logout} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-border bg-background px-3 sm:px-4">
          <SidebarTrigger aria-label="Buka/tutup navigasi" />
          <span className="text-sm font-medium text-foreground md:hidden">Invitation Admin</span>
        </header>
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
