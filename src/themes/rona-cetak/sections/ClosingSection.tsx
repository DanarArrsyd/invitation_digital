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
    <Section id="rc-penutup" labelledBy="rc-closing-heading" tone="ink" className={`rc-closing${imageUrl ? "" : " rc-closing-text-only"}`}>
      <div className="rc-closing-copy">
        <span className="rc-closing-mark" aria-hidden="true">R / C</span>
        <h2 id="rc-closing-heading" className="rc-script">{displayName}</h2>
        <p>{message?.trim() || fallbackMessage}</p>
      </div>
      {imageUrl ? <EditorialImage src={imageUrl} alt={imageAlt?.trim() || `Potret ${displayName}`} sizes="(min-width: 1360px) 420px, (min-width: 768px) 36vw, 72vw" aspectRatio="3 / 4" className="rc-closing-image" /> : null}
    </Section>
  );
}
