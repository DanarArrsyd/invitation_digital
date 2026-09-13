"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const GROUPS = [
  {
    label: "Konten",
    tabs: [
      { slug: "general", label: "General" },
      { slug: "people", label: "People" },
      { slug: "events", label: "Events" },
      { slug: "content", label: "Content" },
      { slug: "features", label: "Features" },
    ],
  },
  {
    label: "Media & Gifts",
    tabs: [
      { slug: "gallery", label: "Gallery" },
      { slug: "gifts", label: "Gifts" },
    ],
  },
  {
    label: "Tamu & Respons",
    tabs: [
      { slug: "guests", label: "Guests" },
      { slug: "responses", label: "Responses" },
    ],
  },
  {
    label: "Publikasi",
    tabs: [{ slug: "publish", label: "Publish" }],
  },
] as const;

export function AdminSidebar({ invitationId }: { invitationId: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="top-[57px] h-[calc(100svh-57px)]">
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.tabs.map((tab) => {
                  const href = `/admin/invitations/${invitationId}/${tab.slug}`;
                  return (
                    <SidebarMenuItem key={tab.slug}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={pathname === href}
                      >
                        {tab.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
