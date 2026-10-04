const ATTENDANCE = { attending: "HADIR", not_attending: "TIDAK HADIR" } as const;

/**
 * An orange round postmark stamped beside the RSVP confirmation: a double
 * ring, wavy cancellation lines and "DITERIMA" over the attendance that was
 * sent. Decorative — the status text beside it carries the message.
 */
export function Postmark({ attendance }: { attendance: keyof typeof ATTENDANCE }) {
  return (
    <svg className="cr-postmark" data-cr-postmark="" viewBox="0 0 168 120" aria-hidden="true" focusable="false">
      <circle className="cr-postmark-ring" cx="60" cy="60" r="54" />
      <circle className="cr-postmark-ring cr-postmark-inner" cx="60" cy="60" r="44" />
      <path className="cr-postmark-cancel" d="M116 42c7-5 14 5 21 0s14 5 21 0M116 60c7-5 14 5 21 0s14 5 21 0M116 78c7-5 14 5 21 0s14 5 21 0" />
      <text className="cr-postmark-word" x="60" y="58" textAnchor="middle">DITERIMA</text>
      <text className="cr-postmark-note" x="60" y="76" textAnchor="middle">{ATTENDANCE[attendance]}</text>
    </svg>
  );
}
