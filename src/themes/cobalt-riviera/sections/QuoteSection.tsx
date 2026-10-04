import { RouteRule } from "../components/RivieraOrnaments";
import { Section } from "../components/Section";

export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;

  return (
    <Section id="cr-quote" labelledBy="cr-quote-copy" tone="pool" className="cr-quote">
      <div className="cr-quote-layout">
        <RouteRule />
        <blockquote id="cr-quote-copy">{quote}</blockquote>
        <p aria-hidden="true">Laut / Matahari / Perayaan</p>
      </div>
    </Section>
  );
}
