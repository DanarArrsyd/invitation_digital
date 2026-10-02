export function RouteRule({ className = "" }: { className?: string }) {
  return (
    <span className={`cr-route-rule ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function CeramicLine({ className = "" }: { className?: string }) {
  return (
    <span className={`cr-ceramic-line ${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 40" focusable="false">
        <path d="M0 20h56l20-20 20 20-20 20-20-20M96 20h48l20-20 20 20-20 20-20-20M184 20h56" />
      </svg>
    </span>
  );
}
