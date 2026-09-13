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
  const stroke = tone === "gold" ? "#A98A5C" : "#DCCCB0";

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
  const stroke = tone === "gold" ? "#A98A5C" : "#EFE5D4";

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
        stroke="#A98A5C"
        strokeWidth="1"
        opacity="0.45"
      />
      <path
        d="M18 456V172c0-79 63-144 142-144s142 65 142 144v284"
        stroke="#A98A5C"
        strokeWidth="0.6"
        opacity="0.25"
      />
    </svg>
  );
}
