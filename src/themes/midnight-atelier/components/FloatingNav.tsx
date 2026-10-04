"use client";

import { useMemo } from "react";

import { useActiveSection } from "@/themes/shared/use-active-section";

import { NavIcon, type MidnightNavSection } from "./NavIcon";

export interface NavItem {
  id: `ma-${string}`;
  section: MidnightNavSection;
  label: string;
}

export function FloatingNav({ items }: { items: NavItem[] }) {
  const mountedItems = useMemo(() => {
    if (typeof document === "undefined") return [];
    return items.filter((item) => document.getElementById(item.id) !== null);
  }, [items]);

  const ids = useMemo(() => mountedItems.map((item) => item.id), [mountedItems]);
  const activeId = useActiveSection(ids);

  if (mountedItems.length === 0) return null;

  return (
    <nav className="ma-nav" aria-label="Navigasi undangan">
      <ul>
        {mountedItems.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>
              <NavIcon section={item.section} className="ma-nav-icon" />
              <span className="ma-nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
