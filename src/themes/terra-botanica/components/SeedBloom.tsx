/**
 * A pressed-flower seed on the cover. When the gate opens
 * (`.tb-gate[data-opened="true"]`), CSS draws the stem, unfolds the leaves
 * and opens the petals one by one. Decorative only.
 */
export function SeedBloom() {
  return (
    <svg className="tb-bloom" viewBox="0 0 96 120" fill="none" aria-hidden="true" focusable="false">
      <path className="tb-bloom-stem" d="M48 118C47 90 50 70 48 46" pathLength={1} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path className="tb-bloom-leaf" d="M48 88C36 80 30 84 26 76c10-2 16 2 22 10Z" fill="var(--tb-moss)" />
      <path className="tb-bloom-leaf tb-bloom-leaf--late" d="M49 72c11-8 17-4 23-12-10-2-17 3-23 10Z" fill="var(--tb-moss)" />
      <g transform="translate(48 34)">
        {[0, 60, 120].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <ellipse
              className="tb-bloom-petal"
              rx="7"
              ry="15"
              fill={index === 1 ? "var(--tb-clay)" : "#C98463"}
              style={{ animationDelay: `${0.85 + index * 0.08}s` }}
            />
          </g>
        ))}
        <circle className="tb-bloom-core" r="5" fill="var(--tb-sun)" />
      </g>
      <circle className="tb-bloom-seed" cx="48" cy="116" r="3" fill="var(--tb-cacao)" />
    </svg>
  );
}
