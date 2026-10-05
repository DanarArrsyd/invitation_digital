// The kayon drawn on a 100×160 grid: a leaf outline, tatahan holes punched
// through it, a dotted rim, the tree of life and the gate (kori). The body
// takes currentColor and the holes take --kk-hole, so one mark reads as a
// shadow on the kelir and as gold on the dark stage.
const OUTLINE = "M50 4C62 22 84 46 90 78C95 104 88 124 74 134L74 150L26 150L26 134C12 124 5 104 10 78C16 46 38 22 50 4Z";

export function Gunungan({ uid, className = "" }: { uid: string; className?: string }) {
  const pattern = `${uid}-tatah`;
  const clip = `${uid}-inner`;

  return (
    <svg className={`kk-gunungan ${className}`} viewBox="0 0 100 160" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={pattern} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r=".85" className="kk-gunungan-hole" />
        </pattern>
        <clipPath id={clip}>
          <path transform="translate(7 10) scale(.86)" d={OUTLINE} />
        </clipPath>
      </defs>
      <path fill="currentColor" d={OUTLINE} />
      <rect width="100" height="160" fill={`url(#${pattern})`} clipPath={`url(#${clip})`} />
      <path
        className="kk-gunungan-rim"
        fill="none"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="0 3.2"
        transform="translate(3.5 5) scale(.93)"
        d={OUTLINE}
      />
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path strokeWidth="5" d="M50 120V34" />
        <path
          strokeWidth="3"
          d="M50 98C40 90 30 88 21 80M50 98C60 90 70 88 79 80M50 78C41 70 34 62 29 50M50 78C59 70 66 62 71 50M50 58C45 50 42 42 42 33M50 58C55 50 58 42 58 33"
        />
      </g>
      <path fill="currentColor" d="M36 150V126C36 117 42 112 50 112C58 112 64 117 64 126V150Z" />
      <path className="kk-gunungan-rim" fill="none" strokeWidth="1" d="M50 115V150M40 128H60" />
      <path fill="currentColor" d="M22 150H78V154H22Z" />
    </svg>
  );
}

/** A thin rule with a small gunungan at its centre. */
export function GununganRule({ uid }: { uid: string }) {
  return (
    <div className="kk-rule" aria-hidden="true">
      <Gunungan uid={uid} />
    </div>
  );
}
