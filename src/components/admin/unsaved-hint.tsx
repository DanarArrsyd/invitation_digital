"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shows "Belum disimpan" once anything in the surrounding form changes and
 * clears it when the form is submitted. Place it inside the form.
 */
export function UnsavedHint() {
  const ref = useRef<HTMLSpanElement>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const markDirty = () => setDirty(true);
    const markClean = () => setDirty(false);
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", markClean);
    form.addEventListener("reset", markClean);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", markClean);
      form.removeEventListener("reset", markClean);
    };
  }, []);

  return (
    <span ref={ref} aria-live="polite" className="mr-auto flex items-center gap-2 text-xs font-medium text-[#8a5a12]">
      {dirty ? (
        <>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--tr-brass)]" />
          Belum disimpan
        </>
      ) : null}
    </span>
  );
}
