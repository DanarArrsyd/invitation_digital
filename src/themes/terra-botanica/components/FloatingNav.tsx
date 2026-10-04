"use client";

import { useMemo } from "react";
import type { NavSectionKey } from "@/themes/shared/nav-priority";
import { useActiveSection } from "@/themes/shared/use-active-section";

import { NavIcon } from "./NavIcon";

export interface NavItem {
  id: `tb-${string}`;
  section: NavSectionKey;
  label: string;
}

export function FloatingNav({ items }: { items: NavItem[] }) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useActiveSection(ids);
  if (items.length === 0) return null;

  return (
    <nav className="tb-nav" aria-label="Navigasi undangan">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>
              <NavIcon section={item.section} />
              <span className="tb-nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
