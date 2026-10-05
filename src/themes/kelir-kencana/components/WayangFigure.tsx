import type { CSSProperties } from "react";

import { KELIR_KENCANA_FIGURES } from "../tokens";

export type WayangName = keyof typeof KELIR_KENCANA_FIGURES;

/**
 * An owner-supplied wayang figure. "shadow" paints it as the shadow cast on
 * the kelir (a mask over sogan); "colour" shows the figure as the dalang sees
 * it from behind the screen. Always decorative.
 */
export function WayangFigure({ name, mode, className = "" }: {
  name: WayangName;
  mode: "shadow" | "colour";
  className?: string;
}) {
  const figure = KELIR_KENCANA_FIGURES[name];
  const style = {
    "--kk-figure": `url("${figure.src}")`,
    aspectRatio: `${figure.width} / ${figure.height}`,
  } as CSSProperties;

  return (
    <span
      className={`kk-figure kk-figure-${mode} kk-figure-${name} ${className}`}
      style={style}
      data-figure={name}
      aria-hidden="true"
    />
  );
}
