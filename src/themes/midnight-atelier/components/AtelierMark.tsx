export function AtelierMark({ className = "" }: { className?: string }) {
  return (
    <span className={`ma-mark ${className}`}>
      <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
        <path d="M48 5v86M5 48h86" />
        <path d="M48 20 63 48 48 76 33 48 48 20Z" />
        <circle cx="48" cy="48" r="4" />
      </svg>
    </span>
  );
}
