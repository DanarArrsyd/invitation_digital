import { Gunungan } from "../components/Gunungan";
import { KelirImage } from "../components/KelirImage";
import { Section } from "../components/Section";
import { WayangFigure } from "../components/WayangFigure";

// Tancep kayon: back on the dark stage, the gold gunungan is planted between
// the two figures, now in full colour as the dalang sees them.
export function ClosingSection({ displayName, message, imageUrl, imageAlt }: {
  displayName: string;
  message: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Section
      id="kk-penutup"
      labelledBy="kk-closing-heading"
      tone="malam"
      className={`kk-closing${imageUrl ? "" : " kk-closing-text-only"}`}
    >
      {imageUrl ? (
        <KelirImage
          src={imageUrl}
          alt={imageAlt?.trim() || `Potret penutup ${displayName}`}
          sizes="(min-width: 768px) 560px, 92vw"
          aspectRatio="16 / 10"
          className="kk-closing-image"
        />
      ) : null}
      <div className="kk-closing-tableau" aria-hidden="true">
        <WayangFigure name="satria" mode="colour" />
        <Gunungan uid="kk-closing-gunungan" />
        <WayangFigure name="putri" mode="colour" />
      </div>
      <p className="kk-eyebrow"><span className="kk-act">Tancep Kayon</span></p>
      {message?.trim()
        ? <p className="kk-closing-message">{message}</p>
        : <p className="kk-closing-message">Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>}
      <h2 id="kk-closing-heading" className="kk-script">{displayName}</h2>
    </Section>
  );
}
