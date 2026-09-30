import { AtelierImage } from "../components/AtelierImage";
import { AtelierMark } from "../components/AtelierMark";
import { Section } from "../components/Section";

export function ClosingSection({ displayName, message, imageUrl, imageAlt }: {
  displayName: string;
  message: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Section
      id="ma-penutup"
      labelledBy="ma-closing-heading"
      tone="ink"
      className={`ma-closing${imageUrl ? "" : " ma-closing-text-only"}`}
    >
      <div className="ma-closing-copy">
        <AtelierMark />
        <h2 id="ma-closing-heading">{displayName}</h2>
        {message?.trim() ? <p>{message}</p> : null}
      </div>
      {imageUrl ? (
        <AtelierImage
          src={imageUrl}
          alt={imageAlt?.trim() || `Potret ${displayName}`}
          sizes="(min-width: 1100px) 38vw, (min-width: 768px) 44vw, 88vw"
          aspectRatio="3 / 4"
          className="ma-closing-image"
        />
      ) : null}
    </Section>
  );
}
