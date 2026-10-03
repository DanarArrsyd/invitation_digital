/**
 * Nusantara ornament set — thin geometric line work drawn from carving and
 * textile grids. Decorative only: always aria-hidden, never pointer-capturing.
 */

export function OrnamentDivider({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "light";
}) {
  const stroke = tone === "gold" ? "#A87A3D" : "#D9C6A5";

  return (
    <svg
      viewBox="0 0 240 16"
      className={`h-4 w-[min(240px,60%)] ${className}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 8h88" stroke={stroke} strokeWidth="0.75" opacity="0.55" />
      <path d="M152 8h88" stroke={stroke} strokeWidth="0.75" opacity="0.55" />
      <path d="M120 1.5 126.5 8 120 14.5 113.5 8Z" stroke={stroke} strokeWidth="0.9" />
      <path d="M104 8h4M132 8h4" stroke={stroke} strokeWidth="0.9" />
      <circle cx="120" cy="8" r="1.1" fill={stroke} />
    </svg>
  );
}

export function OrnamentCorner({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "light";
}) {
  const stroke = tone === "gold" ? "#A87A3D" : "#EFE5D4";

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 20V0h20" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path d="M8 26V8h18" stroke={stroke} strokeWidth="0.7" opacity="0.45" />
      <path d="M14 6.5 17.5 10 14 13.5 10.5 10Z" stroke={stroke} strokeWidth="0.7" opacity="0.7" />
    </svg>
  );
}

/** Arch silhouette — pendopo/gateway inspired, used to frame the cover. */
export function OrnamentArch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 460"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <path
        d="M4 456V168C4 80 74 6 160 6s156 74 156 162v288"
        stroke="#A87A3D"
        strokeWidth="1"
        opacity="0.45"
      />
      <path
        d="M18 456V172c0-79 63-144 142-144s142 65 142 144v284"
        stroke="#A87A3D"
        strokeWidth="0.6"
        opacity="0.25"
      />
    </svg>
  );
}

/**
 * Gunungan (kayon) — the wayang "tree of life" a dalang raises to open and
 * close a lakon. Line work only; colour comes from `currentColor`.
 */
export function Gunungan({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 6C70 52 30 104 22 170c-4 34 6 62 20 84h116c14-22 24-50 20-84C170 104 130 52 100 6Z" strokeWidth="1.4" />
        <path d="M100 34C78 72 50 112 44 166c-3 28 4 50 14 70h84c10-20 17-42 14-70-6-54-34-94-56-132Z" strokeWidth="0.8" opacity="0.7" />
        <path
          d="M100 70v170M100 110c-16-10-30-6-38 6M100 110c16-10 30-6 38 6M100 150c-22-12-40-6-50 10M100 150c22-12 40-6 50 10M100 190c-26-10-44-2-54 16M100 190c26-10 44-2 54 16"
          stroke="var(--ni-sogan)"
          strokeWidth="0.7"
          opacity="0.6"
        />
        <path d="M86 228h28v12H86zM92 222h16" strokeWidth="0.8" opacity="0.7" />
      </g>
    </svg>
  );
}
