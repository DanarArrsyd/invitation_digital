
export function QuoteSection({ quote }: { quote: string | null }) {
  if (!quote?.trim()) return null;
  return (
    <section id="rc-kutipan" className="rc-quote" aria-label="Kutipan pembuka">
      <div className="rc-quote-sheet">
        <span aria-hidden="true" className="rc-quote-mark">“</span>
        <blockquote>{quote}</blockquote>
      </div>
    </section>
  );
}
