/**
 * Brick-red wax seal pressed onto a gift card once its number is copied —
 * the same seal that closes a keraton letter. The button text and the
 * status line carry the meaning; the seal is decorative.
 */
export function WaxSeal({ stamped }: { stamped: boolean }) {
  return (
    <span className="ni-wax-seal" data-ni-seal="" data-stamped={stamped ? "" : undefined} aria-hidden="true">
      <span className="ni-wax-seal-text">Tersalin</span>
    </span>
  );
}
