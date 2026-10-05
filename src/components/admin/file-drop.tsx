"use client";

import { ImageUp, Music } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A file input dressed as a drop area. The real input stays in the form (and
 * receives dropped files), so server actions read `name` as before.
 */
export function FileDrop({
  id,
  name = "file",
  accept,
  required,
  multiple,
  label,
  hint,
  kind = "image",
  describedBy,
  className,
}: {
  id?: string;
  name?: string;
  accept: string;
  required?: boolean;
  multiple?: boolean;
  label: string;
  hint?: string;
  kind?: "image" | "audio";
  describedBy?: string;
  className?: string;
}) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const [picked, setPicked] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const Icon = kind === "audio" ? Music : ImageUp;

  return (
    <label
      htmlFor={inputId}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDrop={() => setDragging(false)}
      className={cn(
        "relative flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-input bg-[color-mix(in_oklch,var(--card),var(--muted)_40%)] px-4 py-4 transition-colors hover:border-ring hover:bg-muted/60 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25",
        dragging && "border-ring bg-muted/70",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{picked ?? label}</span>
        <span className="text-xs leading-5 text-muted-foreground">
          {picked ? "Siap diunggah. Tekan tombol unggah untuk menyimpan." : hint ?? "Pilih file atau tarik ke sini."}
        </span>
      </span>
      {/* Covers the whole area so a dropped file lands on the input itself. */}
      <input
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        required={required}
        multiple={multiple}
        aria-describedby={describedBy}
        onChange={(event) => {
          const files = event.currentTarget.files;
          setPicked(
            !files || files.length === 0 ? null : files.length === 1 ? files[0].name : `${files.length} file dipilih`,
          );
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
