import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="ma-dress-code" labelledBy="ma-dress-code-heading" tone="pearl" className="ma-dress-code">
      <Spotlight className="ma-chapter-heading">
        <p>Untuk malam itu</p>
        <h2 id="ma-dress-code-heading">Saran busana</h2>
      </Spotlight>
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
