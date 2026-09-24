"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks the last section above the viewport's upper third. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  const tickingRef = useRef(false);

  useEffect(() => {
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const pickByGeometry = () => {
      const line = window.innerHeight * 0.32;
      let current = elements[0].id;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line) current = el.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        pickByGeometry();
        tickingRef.current = false;
      });
    };

    pickByGeometry();

    const observer = new IntersectionObserver(
      () => pickByGeometry(),
      { rootMargin: "-32% 0px -55% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}
