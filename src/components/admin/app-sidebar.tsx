"use client";

import { FileHeart, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const MAIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/invitations", label: "Undangan", icon: FileHeart },
] as const;

const EDITOR_GROUPS = [
  {
    label: "Konten",
    sections: [
      { slug: "general", label: "Umum" },
      { slug: "people", label: "Mempelai" },
      { slug: "events", label: "Acara" },
      { slug: "content", label: "Teks & Cerita" },
      { slug: "features", label: "Fitur" },
    ],
  },
  {
    label: "Media & Hadiah",
    sections: [
      { slug: "gallery", label: "Galeri" },
      { slug: "gifts", label: "Rekening Hadiah" },
    ],
  },
  {
    label: "Tamu & Respons",
    sections: [
      { slug: "guests", label: "Tamu" },
      { slug: "responses", label: "RSVP & Ucapan" },
    ],
  },
  {
    label: "Publikasi",
    sections: [{ slug: "publish", label: "Publikasi" }],
  },
] as const;

/** `/admin/invitations/<id>/<section>` → its id, unless it is the "new" form. */
export function editingInvitationId(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/invitations\/([^/]+)(?:\/|$)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}

/**
 * One navigation surface for the whole admin. Opening an invitation adds
 * its editor sections below the main links instead of swapping in a second
 * sidebar, so "where am I" and "how do I get back" live in the same place.
 */
export function AppSidebar({
  userEmail,
  logoutAction,
}: {
  userEmail: string | null;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const invitationId = editingInvitationId(pathname);

  // The mobile sheet stays open across client navigations unless closed.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link
          href="/admin/dashboard"
          onClick={closeOnMobile}
          className="text-sm font-semibold text-sidebar-foreground"
        >
          Invitation Admin
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map(({ href, label, icon: Icon }) => {
                // "Undangan" stays highlighted on the list and the create form;
                // inside an invitation the editor section carries the highlight.
                const isActive =
                  href === "/admin/invitations"
                    ? pathname === href || pathname === "/admin/invitations/new"
                    : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} onClick={closeOnMobile} />}
                      isActive={isActive}
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {invitationId
          ? EDITOR_GROUPS.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.sections.map((section) => {
                      const href = `/admin/invitations/${invitationId}/${section.slug}`;
                      return (
                        <SidebarMenuItem key={section.slug}>
                          <SidebarMenuButton
                            render={<Link href={href} onClick={closeOnMobile} />}
                            isActive={pathname === href}
                          >
                            {section.label}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {userEmail ? (
          <p className="truncate px-2 text-xs text-muted-foreground" title={userEmail}>
            {userEmail}
          </p>
        ) : null}
        <form action={logoutAction}>
          <SidebarMenuButton type="submit">
            <LogOut aria-hidden="true" />
            <span>Keluar</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
