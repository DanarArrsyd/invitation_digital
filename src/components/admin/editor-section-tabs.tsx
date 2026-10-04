"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { EDITOR_SECTIONS } from "./editor-sections";

/**
 * Below md the sidebar lives in a sheet, so switching editor sections would
 * take two taps. This strip keeps every section one tap away on phones.
 */
export function EditorSectionTabs({ invitationId }: { invitationId: string }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="Bagian undangan" className="-mx-4 overflow-x-auto px-4 md:hidden">
      <ul className="flex w-max gap-1.5 pb-1">
        {EDITOR_SECTIONS.map(({ slug, label, icon: Icon }) => {
          const href = `/admin/invitations/${invitationId}/${slug}`;
          const isActive = pathname === href;
          return (
            <li key={slug}>
              <Link
                ref={isActive ? activeRef : undefined}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-muted-foreground",
                  isActive && "border-primary bg-primary text-primary-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-3.5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
