"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { slug: "general", label: "General" },
  { slug: "people", label: "People" },
  { slug: "events", label: "Events" },
  { slug: "content", label: "Content" },
  { slug: "gallery", label: "Gallery" },
  { slug: "gifts", label: "Gifts" },
  { slug: "guests", label: "Guests" },
  { slug: "features", label: "Features" },
  { slug: "responses", label: "Responses" },
  { slug: "publish", label: "Publish" },
] as const;

export function AdminTabs({ invitationId }: { invitationId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-neutral-200">
      {TABS.map((tab) => {
        const href = `/admin/invitations/${invitationId}/${tab.slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900",
              isActive && "border-b-2 border-neutral-900 text-neutral-900",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
