export function SunMark({ className = "" }: { className?: string }) {
  return (
    <span className={`cr-sun-mark ${className}`}>
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <circle cx="48" cy="48" r="40" />
        <path d="M48 8v80M8 48h80" />
      </svg>
    </span>
  );
}
