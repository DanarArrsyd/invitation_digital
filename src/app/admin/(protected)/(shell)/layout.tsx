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
    <SidebarProvider data-admin-theme="">
      <AppSidebar userEmail={user?.email ?? null} logoutAction={logout} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur sm:px-5">
          <SidebarTrigger aria-label="Buka/tutup navigasi" />
          <span className="flex items-center gap-2 text-sm font-medium text-foreground md:hidden">
            <span className="flex size-7 items-center justify-center border border-foreground/20 text-[0.65rem] font-semibold">
              IP
            </span>
            Invitation Platform
          </span>
        </header>
        <div className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
