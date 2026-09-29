export function Botanical({ variant = "line", className = "" }: {
  variant?: "line" | "clay" | "moss";
  className?: string;
}) {
  return (
    <svg className={`tb-botanical tb-botanical-${variant} ${className}`} viewBox="0 0 240 360" fill="none" aria-hidden="true" focusable="false">
      {variant === "line" ? (
        <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M72 346C146 242 91 132 174 24M114 255C70 239 48 203 43 159c45 10 72 42 71 96ZM119 208c54-17 81-52 84-100-44 15-74 47-84 100ZM131 129c-39-10-58-39-59-79 36 11 55 34 59 79ZM157 58c25 2 44-13 57-38-30-1-49 10-57 38Z" />
          <path d="m43 159 71 96m89-147-84 100M72 50l59 79" />
        </g>
      ) : variant === "clay" ? (
        <path fill="currentColor" d="M17 348C-9 256 0 136 104 29 130 4 163-2 213 2c39 103 26 207-50 291-40 44-83 62-146 55Z" />
      ) : (
        <path fill="currentColor" d="M22 352C4 303-5 247 5 197c55 6 82 35 101 83-24-87-28-168 16-240 43 36 55 91 42 149 10-80 33-137 72-181 18 100 5 201-58 267-42 44-96 70-156 77Z" />
      )}
    </svg>
  );
}
