import type { DressCodeSettings } from "@/lib/utils/dressCode";

import { BotanicalDivider } from "../components/Botanical";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { Section } from "../components/Section";

export function DressCodeSection({ dressCode }: { dressCode: DressCodeSettings }) {
  const { description, groups } = dressCode;
  if (!description && groups.length === 0) return null;

  return (
    <Section id="ni-dresscode" tone="cream" floral>
      <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
        <Reveal variant="fade" className="flex flex-col items-center gap-4">
          <p className="ni-eyebrow">Dress Code</p>
          <h2 className="ni-display text-[clamp(2.1rem,5.5vw,3.2rem)]">Saran Busana</h2>
          <BotanicalDivider />
        </Reveal>

        {description ? (
          <Reveal variant="up" delay={0.1} className="mt-6">
            <p className="ni-body text-[0.95rem] leading-[1.8]">{description}</p>
          </Reveal>
        ) : null}

        {groups.length > 0 ? (
          <div className="ni-dresscode-groups mt-10">
            {groups.map((group, index) => (
              <Reveal key={group.label} variant="up" delay={0.14 + index * 0.08} className="ni-dresscode-group">
                <p className="ni-eyebrow">{group.label}</p>
                <Stagger className="ni-dresscode-swatches" gap={0.06} delay={0.05}>
                  {group.colors.map((color) => (
                    <StaggerItem key={color} className="ni-dresscode-swatch">
                      <span className="ni-dresscode-dot" style={{ background: color }} aria-hidden="true" />
                      <span className="ni-dresscode-hex">{color}</span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
