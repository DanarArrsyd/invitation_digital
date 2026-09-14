import { Section } from "../components/Section";
import { Reveal } from "../components/Reveal";
import { BotanicalDivider } from "../components/Botanical";

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
      {openingQuote ? (
        <Reveal variant="fade" className="mb-10 flex justify-center md:mb-14">
          <BotanicalDivider />
        </Reveal>
      ) : null}
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
              <p className="ni-serif relative text-[clamp(1.5rem,3.4vw,2.35rem)] leading-[1.5] text-[var(--ni-brown)] italic">
                {openingQuote}
                <span
                  className="ni-serif pointer-events-none ml-1 inline-block align-[-0.28em] text-[1.4em] not-italic select-none"
                  style={{ color: "var(--ni-gold)" }}
                  aria-hidden="true"
                >
                  &rdquo;
                </span>
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
