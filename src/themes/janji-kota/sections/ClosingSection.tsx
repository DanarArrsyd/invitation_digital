import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

export function ClosingSection({ displayName, message, fallbackMessage, imageUrl, imageAlt }: {
  displayName: string;
  message: string | null;
  fallbackMessage: string;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Section id="jk-penutup" labelledBy="jk-closing-heading" tone="night" className={`jk-closing${imageUrl ? "" : " jk-closing-text-only"}`}>
      <div className="jk-closing-copy">
        <span className="jk-closing-mark" aria-hidden="true">J / K</span>
        <h2 id="jk-closing-heading" className="jk-script">{displayName}</h2>
        <p>{message?.trim() || fallbackMessage}</p>
      </div>
      {imageUrl ? <EditorialImage src={imageUrl} alt={imageAlt?.trim() || `Potret ${displayName}`} sizes="(min-width: 1360px) 420px, (min-width: 768px) 36vw, 72vw" aspectRatio="3 / 4" className="jk-closing-image" /> : null}
    </Section>
  );
}
