// One crest and one trough per 60 units; the body's lower edge and the foam
// trace the same curve, so the foam sits exactly on the wave's edge.
const FOAM = "M0 6C15 0 15 0 30 6S45 12 60 6 75 0 90 6 105 12 120 6";
const BODY = "M0 0H120V6C105 12 105 12 90 6S75 0 60 6 45 12 30 6 15 0 0 6Z";

/**
 * Ombak surut: the cover's sea. A kolam swell lies under a cobalt wave; when
 * the cover opens (`.cr-gate[data-opened="true"]`) CSS draws both up and away,
 * foam edge first, and the couple's names are left on the porcelain sand.
 * Decorative; the cover's own heading carries the names for readers.
 */
export function RecedingWaves({ names }: { names: string }) {
  return (
    <div className="cr-sea" aria-hidden="true">
      <p className="cr-sand-names cr-script">{names}</p>
      {(["back", "front"] as const).map((layer) => (
        <div key={layer} className={`cr-wave cr-wave-${layer}`}>
          <svg className="cr-wave-edge" viewBox="0 0 120 12" preserveAspectRatio="none" focusable="false">
            <path className="cr-wave-body" d={BODY} />
            <path className="cr-wave-foam" d={FOAM} />
          </svg>
        </div>
      ))}
    </div>
  );
}
