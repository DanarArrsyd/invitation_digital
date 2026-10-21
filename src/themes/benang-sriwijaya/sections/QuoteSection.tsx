
export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;
  return (
    <section id="bs-kutipan" className="bs-quote" aria-label="Kutipan pembuka">
      <div className="bs-quote-frame">
        <span aria-hidden="true" className="bs-quote-mark">“</span>
        <blockquote>{quote}</blockquote>
      </div>
    </section>
  );
}
