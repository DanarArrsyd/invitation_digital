import { getCoupleInitials } from "@/lib/utils/coupleName";

import { EditorialImage } from "../components/EditorialImage";
import { BotanicalDivider, FloralCorner, MonogramBadge } from "../components/Botanical";
import { Parallax } from "../components/Parallax";
import { Reveal } from "../components/Reveal";

/**
 * Finale. Uses whatever photography the invitation already has; with none, it
 * falls back to a deep panel with the lattice so the ending still feels closed.
 */
export function ClosingSection({
  closingMessage,
  title,
  imageUrl,
}: {
  closingMessage: string | null;
  title: string;
  imageUrl: string | null;
}) {
  const initials = getCoupleInitials(title);

  return (
    <section className="ni-grain ni-panel-dark relative isolate overflow-hidden">
      {imageUrl ? (
        <>
          <Parallax className="absolute inset-[-6%_0]" distance={36}>
            
            <EditorialImage src={imageUrl} alt=""  className="h-full w-full object-cover" />
          </Parallax>
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,21,16,0.72) 0%, rgba(26,21,16,0.38) 42%, rgba(26,21,16,0.82) 100%)",
            }}
          />
        </>
      ) : (
        <div className="ni-lattice absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      )}

      <FloralCorner className="ni-floral-edge opacity-30" />
      <div
        className="relative mx-auto flex max-w-[760px] flex-col items-center gap-8 text-center"
        style={{ paddingBlock: "clamp(5rem,12vw,9rem)", paddingInline: "var(--ni-gutter)" }}
      >
        {closingMessage ? (
          <Reveal variant="up">
            <p
              className="text-[0.98rem] leading-[1.9]"
              style={{ color: "rgba(252,250,245,0.78)" }}
            >
              {closingMessage}
            </p>
          </Reveal>
        ) : null}

        <Reveal variant="fade" delay={0.1} className="flex justify-center">
          <BotanicalDivider className="text-[var(--ni-gold-soft)]" />
        </Reveal>

        <Reveal variant="up" delay={0.16}>
          <p
            className="ni-serif text-[clamp(2.2rem,7vw,4rem)] leading-tight"
            style={{ color: "var(--ni-ivory)" }}
          >
            {title}
          </p>
        </Reveal>

        {initials ? (
          <Reveal variant="fade" delay={0.22}>
            <MonogramBadge initials={initials} />
          </Reveal>
        ) : null}

        <Reveal variant="fade" delay={0.28}>
          <p
            className="text-[0.62rem] tracking-[0.4em] uppercase"
            style={{ color: "var(--ni-gold-soft)" }}
          >
            Terima Kasih
          </p>
        </Reveal>
      </div>
    </section>
  );
}
