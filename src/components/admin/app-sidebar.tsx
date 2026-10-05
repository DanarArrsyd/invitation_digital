"use client";

import { ArrowLeft, BadgePercent, ExternalLink, FileHeart, LayoutDashboard, LayoutTemplate, LogOut, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { TemurayaMark } from "@/components/brand/temuraya-mark";
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

import { EDITOR_GROUPS, editingInvitationId } from "./editor-sections";

export { editingInvitationId } from "./editor-sections";

const MAIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/invitations", label: "Undangan", icon: FileHeart },
  { href: "/admin/invitations/new", label: "Undangan baru", icon: Plus },
] as const;

const SITE_NAV = [
  { href: "/admin/site/catalog", label: "Katalog Template", icon: LayoutTemplate },
  { href: "/admin/site/packages", label: "Paket & Harga", icon: BadgePercent },
  { href: "/admin/site/contact", label: "Kontak", icon: MessageCircle },
] as const;

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
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin/dashboard" onClick={closeOnMobile} className="flex items-center gap-3">
          <TemurayaMark tone="light" className="h-9 text-white" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">Temuraya</span>
            <span className="block truncate text-xs text-white/55">Ruang kerja pengelola</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map(({ href, label, icon: Icon }) => {
                // Inside an invitation the editor section carries the highlight.
                const isActive =
                  href === "/admin/invitations" ? pathname === href : pathname.startsWith(href);
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/45">Situs Temuraya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SITE_NAV.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} onClick={closeOnMobile} />}
                    isActive={pathname.startsWith(href)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="/" target="_blank" rel="noreferrer" />}>
                  <ExternalLink aria-hidden="true" />
                  <span>Lihat situs</span>
                  <span className="sr-only">(tab baru)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {invitationId ? (
          <>
            <div className="mx-4 mt-2 flex items-center gap-2 border-t border-sidebar-border pt-4 text-xs text-white/55">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              <Link href="/admin/invitations" onClick={closeOnMobile} className="hover:text-white">
                Sedang mengedit undangan
              </Link>
            </div>
            {EDITOR_GROUPS.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-white/45">{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.sections.map(({ slug, label, icon: Icon }) => {
                      const href = `/admin/invitations/${invitationId}/${slug}`;
                      return (
                        <SidebarMenuItem key={slug}>
                          <SidebarMenuButton
                            render={<Link href={href} onClick={closeOnMobile} />}
                            isActive={pathname === href}
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
            ))}
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {userEmail ? (
          <div className="flex items-center gap-3 px-1 py-1">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white"
            >
              {userEmail.charAt(0)}
            </span>
            <p className="min-w-0 truncate text-xs text-white/70" title={userEmail}>
              {userEmail}
            </p>
          </div>
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
