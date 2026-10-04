import type { CSSProperties } from "react";

/**
 * A tasselled dance card shown after an attending RSVP; the guest's name and
 * attendance are "written" in script. The confirmation beside it carries the
 * message for assistive technology, so the card is decorative.
 */
export function DanceCard({ name }: { name: string | null }) {
  const rows = [
    ...(name ? [{ label: "Nama", value: name }] : []),
    { label: "Kehadiran", value: "Hadir" },
  ];

  return (
    <div className="ma-dance-card" data-ma-dance-card="" aria-hidden="true">
      <svg className="ma-dance-tassel" viewBox="0 0 24 64" fill="none" focusable="false">
        <path d="M12 0v22" />
        <path d="m12 22 4 5-4 5-4-5Z" />
        <path d="M9 32h6l1 26H8Z" />
        <path d="M10 36v20M12 36v22M14 36v20" />
      </svg>
      <p className="ma-label">Dance card</p>
      <dl>
        {rows.map((row, index) => (
          <div key={row.label}>
            <dt className="ma-label">{row.label}</dt>
            <dd className="ma-script" style={{ "--ma-write-delay": `${(0.5 + index * 0.6).toFixed(1)}s` } as CSSProperties}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
