import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings | null }) {
  if (!dressCode) return null;

  return (
    <Section id="tb-dress-code" labelledBy="tb-dress-code-heading" tone="linen" className="tb-dress-code">
      <SectionHeading id="tb-dress-code-heading" title="Dress code" />
      {dressCode.description ? <p className="tb-dress-description">{dressCode.description}</p> : null}
      {dressCode.groups.length > 0 ? (
        <div className="tb-dress-groups">
          {dressCode.groups.map((group) => (
            <div key={group.label} className="tb-dress-group">
              <h3>{group.label}</h3>
              <ul>{group.colors.map((color) => (
                <li key={color}><span className="tb-dress-swatch" style={{ backgroundColor: color }} aria-hidden="true" /><span>{color}</span></li>
              ))}</ul>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
