import { TemurayaMark } from "@/components/brand/temuraya-mark";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentAdmin } from "@/server/auth/current-admin";

import { logout } from "../actions";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  // The parent layout already redirected signed-out visitors; this shares
  // its cached check and is only for showing who is signed in.
  const admin = await getCurrentAdmin();

  return (
    <SidebarProvider data-admin-theme="">
      <AppSidebar userEmail={admin?.email ?? null} logoutAction={logout} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur sm:px-5">
          <SidebarTrigger aria-label="Buka/tutup navigasi" />
          <span className="flex items-center gap-2 text-sm font-medium text-foreground md:hidden">
            <TemurayaMark className="h-7" />
            Temuraya
          </span>
        </header>
        <div className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
