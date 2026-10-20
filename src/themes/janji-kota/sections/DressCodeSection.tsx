import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="jk-dress-code" labelledBy="jk-dress-code-heading" tone="concrete" className="jk-dress-code">
      <SectionHeading id="jk-dress-code-heading" title="Dress code" />
      {dressCode.description ? <p className="jk-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="jk-dress-groups">
          {dressCode.groups.map((group) => (
            <div key={group.label} className="jk-dress-group">
              <h3>{group.label}</h3>
              <ul aria-hidden="true">{group.colors.map((color) => (
                <li key={color}><span className="jk-dress-swatch" style={{ backgroundColor: color }} /></li>
              ))}</ul>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
