import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="ma-dress-code" labelledBy="ma-dress-code-heading" tone="pearl" className="ma-dress-code">
      <header className="ma-chapter-heading">
        <p>Wardrobe note</p>
        <h2 id="ma-dress-code-heading">Dress code</h2>
      </header>
      {dressCode.description ? <p className="ma-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="ma-dress-groups">
          {dressCode.groups.map((group) => (
            <section key={group.label} className="ma-dress-group" aria-label={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.colors.map((color) => (
                  <li key={color}>
                    <span className="ma-dress-swatch" style={{ backgroundColor: color }} aria-hidden="true" />
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
