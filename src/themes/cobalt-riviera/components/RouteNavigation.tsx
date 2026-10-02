"use client";

import { useMemo } from "react";

import type { ThemeSectionKey } from "@/themes/section-contract";
import { useActiveSection } from "@/themes/shared/use-active-section";

export interface RivieraRouteItem {
  id: `cr-${string}`;
  section: ThemeSectionKey;
  label: string;
}

export function RouteNavigation({ items }: { items: RivieraRouteItem[] }) {
  const mountedItems = useMemo(() => {
    if (typeof document === "undefined") return [];
    return items.filter((item) => document.getElementById(item.id) !== null);
  }, [items]);
  const ids = useMemo(() => mountedItems.map((item) => item.id), [mountedItems]);
  const activeId = useActiveSection(ids);

  if (mountedItems.length === 0) return null;

  return (
    <nav className="cr-route-nav" aria-label="Navigasi undangan">
      <ul>
        {mountedItems.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>
              <span className="cr-route-glyph" aria-hidden="true">
                <span />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
