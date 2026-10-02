import { AtelierMark } from "../components/AtelierMark";

export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;

  return (
    <section id="ma-kutipan" className="ma-quote" aria-label="Kutipan pembuka">
      <div className="ma-quote-inner">
        <AtelierMark />
        <blockquote>{quote}</blockquote>
      </div>
    </section>
  );
}
