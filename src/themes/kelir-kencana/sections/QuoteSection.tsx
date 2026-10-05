import { GununganRule } from "../components/Gunungan";
import { Section } from "../components/Section";

export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;

  return (
    <Section id="kk-quote" labelledBy="kk-quote-copy" tone="kelir-deep" className="kk-quote">
      <GununganRule uid="kk-quote-gunungan" />
      <blockquote id="kk-quote-copy">{quote}</blockquote>
    </Section>
  );
}
