import type { GiftAccount } from "@/types/invitation";

import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GiftAccountCard } from "./GiftAccountCard";

export function GiftSection({ gifts }: { gifts: GiftAccount[] }) {
  if (gifts.length === 0) return null;

  return (
    <Section id="ni-kado" tone="dark" lattice>
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-4">
          <SectionHeading eyebrow="Tanda Kasih" title="Wedding Gift" align="left" tone="light" />
          <Reveal delay={0.1}>
            <p
              className="mt-6 max-w-[32ch] text-[0.9rem] leading-[1.75]"
              style={{ color: "rgba(252,250,245,0.62)" }}
            >
              Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, berikut
              informasi yang dapat digunakan.
            </p>
          </Reveal>
        </div>

        <Stagger
          className="grid gap-5 md:col-span-7 md:col-start-6 md:grid-cols-2"
          gap={0.1}
        >
          {gifts.map((gift) => (
            <StaggerItem key={gift.id} className="h-full">
              <GiftAccountCard gift={gift} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
