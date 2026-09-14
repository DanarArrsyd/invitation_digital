"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { normalizeHexColor } from "@/lib/utils/dressCode";

const MAX_COLORS = 6;
const FALLBACK_COLOR = "#A98A5C";

/**
 * Visual hex-color-list editor. Still submits as a single comma-separated
 * string under `name` (same shape the server action already parses via
 * parseHexColorList), so this is a drop-in upgrade for the plain text input
 * — no server-side change needed.
 */
export function ColorListInput({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue: string;
  label: string;
}) {
  const [colors, setColors] = useState<string[]>(() => {
    const parsed = defaultValue
      .split(/[,\s]+/)
      .map((v) => normalizeHexColor(v))
      .filter((v): v is string => v !== null);
    return parsed.length > 0 ? parsed : [];
  });
  const baseId = useId();

  function updateColor(index: number, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addColor() {
    setColors((prev) => (prev.length >= MAX_COLORS ? prev : [...prev, FALLBACK_COLOR]));
  }

  function removeColor(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <input type="hidden" name={name} value={colors.join(", ")} />

      <div className="flex flex-wrap items-center gap-3">
        {colors.map((color, index) => {
          const swatchId = `${baseId}-${index}`;
          return (
            <div key={swatchId} className="flex flex-col items-center gap-1">
              <div className="relative">
                <input
                  id={swatchId}
                  type="color"
                  value={normalizeHexColor(color) ?? FALLBACK_COLOR}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="size-9 cursor-pointer rounded-full border border-neutral-300 p-0 [&::-webkit-color-swatch-wrapper]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                  aria-label={`Warna ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  aria-label={`Hapus warna ${index + 1}`}
                  className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-neutral-700 text-[10px] leading-none text-white"
                >
                  ×
                </button>
              </div>
              <span className="text-[10px] tabular-nums text-neutral-500">
                {normalizeHexColor(color) ?? color}
              </span>
            </div>
          );
        })}

        {colors.length < MAX_COLORS ? (
          <Button type="button" variant="outline" size="sm" onClick={addColor}>
            + Warna
          </Button>
        ) : null}
      </div>
    </div>
  );
}
