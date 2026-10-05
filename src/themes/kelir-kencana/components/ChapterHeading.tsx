/** Eyebrow + heading used by every chapter. `act` is the pagelaran label. */
export function ChapterHeading({ id, eyebrow, act, title, lede }: {
  id: string;
  eyebrow: string;
  act?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="kk-heading">
      <p className="kk-eyebrow">
        {act ? <><span className="kk-act">{act}</span><span aria-hidden="true"> · </span></> : null}
        {eyebrow}
      </p>
      <h2 id={id}>{title}</h2>
      {lede ? <p className="kk-lede">{lede}</p> : null}
    </header>
  );
}
