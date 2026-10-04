"use client";

import { useMemo } from "react";

import type { ThemeSectionKey } from "@/themes/section-contract";
import { useActiveSection } from "@/themes/shared/use-active-section";

import { NavIcon } from "./NavIcon";

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
        {mountedItems.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>
              <NavIcon section={item.section} className="cr-route-glyph" />
              <span className="cr-route-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
