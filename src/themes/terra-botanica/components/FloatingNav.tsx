"use client";

import { useMemo } from "react";
import type { ThemeSectionKey } from "@/themes/section-contract";
import { useActiveSection } from "@/themes/shared/use-active-section";

export interface NavItem {
  id: `tb-${string}`;
  section: ThemeSectionKey;
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
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "location" : undefined}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
