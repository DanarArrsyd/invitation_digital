import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";

export function QuoteSection({
  openingQuote,
  openingMessage,
}: {
  openingQuote: string | null;
  openingMessage: string | null;
}) {
  if (!openingQuote && !openingMessage) return null;

  return (
    <Section tone="ivory" className="border-b border-[var(--ni-sand)]">
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        {openingQuote ? (
          <Reveal variant="up" className="md:col-span-7 md:col-start-1">
            <div className="relative">
              <span
                className="ni-serif pointer-events-none absolute -top-10 -left-2 text-[7rem] leading-none select-none md:-top-14 md:text-[10rem]"
                style={{ color: "rgba(169,138,92,0.16)" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="ni-serif relative text-[clamp(1.35rem,3.1vw,2.1rem)] leading-[1.45] text-[var(--ni-brown)] italic">
                {openingQuote}
              </p>
            </div>
          </Reveal>
        ) : null}

        {openingMessage ? (
          <Reveal
            variant="up"
            delay={0.12}
            className={`flex flex-col gap-5 md:col-span-4 ${openingQuote ? "md:col-start-9 md:pt-10" : "md:col-start-1"}`}
          >
            <span
              className="block h-px w-16"
              aria-hidden="true"
              style={{ background: "linear-gradient(90deg, var(--ni-gold), transparent)" }}
            />
            <p className="ni-body text-[0.95rem]">{openingMessage}</p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
