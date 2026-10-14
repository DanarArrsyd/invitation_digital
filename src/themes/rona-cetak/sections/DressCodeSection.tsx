import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="rc-dress-code" labelledBy="rc-dress-code-heading" tone="paper" className="rc-dress-code">
      <SectionHeading id="rc-dress-code-heading" title="Dress code" />
      {dressCode.description ? <p className="rc-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="rc-dress-groups">
          {dressCode.groups.map((group) => (
            <div key={group.label} className="rc-dress-group">
              <h3>{group.label}</h3>
              <ul aria-hidden="true">{group.colors.map((color) => (
                <li key={color}><span className="rc-dress-swatch" style={{ backgroundColor: color }} /></li>
              ))}</ul>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
