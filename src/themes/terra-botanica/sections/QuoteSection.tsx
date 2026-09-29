import { Botanical } from "../components/Botanical";

export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;
  return (
    <section id="tb-kutipan" className="tb-quote" aria-label="Kutipan pembuka">
      <div className="tb-quote-sheet">
        <Botanical className="tb-quote-botanical" />
        <blockquote>{quote}</blockquote>
      </div>
    </section>
  );
}
