import { RivieraImage } from "../components/RivieraImage";
import { Section } from "../components/Section";
import { SunMark } from "../components/SunMark";

export function ClosingSection({ displayName, message, imageUrl, imageAlt }: {
  displayName: string;
  message: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Section
      id="cr-penutup"
      labelledBy="cr-closing-heading"
      tone="cobalt"
      className={`cr-closing${imageUrl ? "" : " cr-closing-text-only"}`}
    >
      <div className="cr-closing-layout">
        <div className="cr-closing-copy">
          <p>Salam hangat dari tepi laut</p>
          <h2 id="cr-closing-heading" className="cr-script">{displayName}</h2>
          {message?.trim() ? <p>{message}</p> : null}
          <SunMark />
        </div>

        {imageUrl ? (
          <RivieraImage
            src={imageUrl}
            alt={imageAlt?.trim() || `Potret penutup ${displayName}`}
            sizes="(min-width: 1200px) 48vw, (min-width: 768px) 54vw, 100vw"
            aspectRatio="16 / 10"
            className="cr-closing-image"
          />
        ) : (
          <div className="cr-closing-horizon" aria-hidden="true"><span /></div>
        )}
      </div>
    </Section>
  );
}
