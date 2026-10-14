import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

/** Title block first, then the 3:4 portrait (DESIGN.md §9 hero photo rule). */
export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  const copy = (
    <div className="rc-hero-copy">
      <h2 id="rc-hero-heading" className="rc-script">{displayName}</h2>
      {message?.trim() ? <p>{message}</p> : null}
    </div>
  );
  return (
    <Section id="rc-beranda" labelledBy="rc-hero-heading" tone="white" className={`rc-hero${imageUrl ? "" : " rc-hero-text-only"}`}>
      {imageUrl ? (
        <>
          {copy}
          <EditorialImage src={imageUrl} alt={`Potret ${displayName}`} sizes="(min-width: 1360px) 492px, (min-width: 768px) 40vw, 88vw" aspectRatio="3 / 4" eager className="rc-hero-image" />
        </>
      ) : (
        <>
          <span className="rc-hero-mark" aria-hidden="true">R / C</span>
          {copy}
        </>
      )}
    </Section>
  );
}
