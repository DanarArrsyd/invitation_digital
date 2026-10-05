import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="kk-dress-code" labelledBy="kk-dress-heading" tone="kelir-deep" className="kk-dress-code">
      <ChapterHeading id="kk-dress-heading" eyebrow="Panduan busana" title="Saran Busana" />
      {dressCode.description ? <p className="kk-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="kk-dress-groups">
          {dressCode.groups.map((group) => (
            <section key={group.label} className="kk-dress-group" aria-label={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.colors.map((color) => (
                  <li key={color}>
                    <span className="kk-dress-swatch" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span>{color}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
