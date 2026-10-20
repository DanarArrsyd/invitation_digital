
export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;
  return (
    <section id="jk-kutipan" className="jk-quote" aria-label="Kutipan pembuka">
      <div className="jk-quote-frame">
        <span aria-hidden="true" className="jk-quote-mark">“</span>
        <blockquote>{quote}</blockquote>
      </div>
    </section>
  );
}
