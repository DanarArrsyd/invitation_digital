import { Botanical } from "../components/Botanical";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

export function ClosingSection({ displayName, message, imageUrl, imageAlt }: {
  displayName: string;
  message: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Section id="tb-penutup" labelledBy="tb-closing-heading" tone="moss" className={`tb-closing${imageUrl ? "" : " tb-closing-text-only"}`}>
      <div className="tb-closing-copy">
        <Botanical className="tb-closing-botanical" />
        <h2 id="tb-closing-heading" className="tb-script">{displayName}</h2>
        {message?.trim() ? <p>{message}</p> : null}
      </div>
      {imageUrl ? <EditorialImage src={imageUrl} alt={imageAlt?.trim() || `Potret ${displayName}`} sizes="(min-width: 1360px) 420px, (min-width: 768px) 36vw, 72vw" aspectRatio="3 / 4" className="tb-closing-image" /> : null}
    </Section>
  );
}
