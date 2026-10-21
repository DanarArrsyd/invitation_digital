import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="bs-dress-code" labelledBy="bs-dress-code-heading" tone="ground" className="bs-dress-code">
      <SectionHeading id="bs-dress-code-heading" title="Dress code" />
      {dressCode.description ? <p className="bs-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="bs-dress-groups">
          {dressCode.groups.map((group) => (
            <div key={group.label} className="bs-dress-group">
              <h3>{group.label}</h3>
              <ul aria-hidden="true">{group.colors.map((color) => (
                <li key={color}><span className="bs-dress-swatch" style={{ backgroundColor: color }} /></li>
              ))}</ul>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
