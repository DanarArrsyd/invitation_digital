import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

/** Title block first, then the 3:4 portrait (DESIGN.md §9 hero photo rule). */
export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  const copy = (
    <div className="jk-hero-copy">
      <h2 id="jk-hero-heading" className="jk-script">{displayName}</h2>
      {message?.trim() ? <p>{message}</p> : null}
    </div>
  );
  return (
    <Section id="jk-beranda" labelledBy="jk-hero-heading" tone="light" className={`jk-hero${imageUrl ? "" : " jk-hero-text-only"}`}>
      {imageUrl ? (
        <>
          {copy}
          <EditorialImage src={imageUrl} alt={`Potret ${displayName}`} sizes="(min-width: 1360px) 492px, (min-width: 768px) 40vw, 88vw" aspectRatio="3 / 4" eager className="jk-hero-image" />
        </>
      ) : (
        <>
          <span className="jk-hero-mark" aria-hidden="true">J / K</span>
          {copy}
        </>
      )}
    </Section>
  );
}
