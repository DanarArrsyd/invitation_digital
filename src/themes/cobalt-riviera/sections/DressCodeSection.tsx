import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="cr-dress-code" labelledBy="cr-dress-heading" tone="pool" className="cr-dress-code">
      <header className="cr-chapter-heading cr-dress-heading">
        <p>Wardrobe coordinates</p>
        <h2 id="cr-dress-heading">Dress code</h2>
      </header>
      {dressCode.description ? <p className="cr-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="cr-dress-groups">
          {dressCode.groups.map((group) => (
            <section key={group.label} className="cr-dress-group" aria-label={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.colors.map((color) => (
                  <li key={color}>
                    <span className="cr-dress-swatch" style={{ backgroundColor: color }} aria-hidden="true" />
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
