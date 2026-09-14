import { EditorialImage } from "../components/EditorialImage";
import type { InvitationStory } from "@/types/invitation";

import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function StorySection({ stories }: { stories: InvitationStory[] }) {
  if (stories.length === 0) return null;

  return (
    <Section id="ni-cerita" className="ni-story" tone="cream" floral>
      <SectionHeading title="Perjalanan Kami" align="left" />

      <div className="relative mt-14 md:mt-20">
        {/* Connector line — decorative, sits left on mobile and centred on desktop. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-px md:left-1/2"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(169,138,92,0.45) 12%, rgba(169,138,92,0.45) 88%, transparent)",
          }}
        />

        <div className="flex flex-col gap-16 md:gap-24">
          {stories.map((story, index) => {
            const textRight = index % 2 === 1;

            return (
              <div key={story.id} className="relative pl-9 md:items-center md:grid md:grid-cols-12 md:gap-10 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute top-2 left-0 size-2.5 rotate-45 md:left-1/2 md:-translate-x-1/2"
                  style={{ background: "var(--ni-gold)" }}
                />

                <Reveal
                  variant={textRight ? "right" : "left"}
                  className={`md:row-start-1 md:col-span-5 ${textRight ? "md:col-start-8 md:order-2" : "md:col-start-1"}`}
                >
                  <div className={textRight ? "" : "md:text-right"}>
                    {story.yearLabel || story.storyDate ? (
                      <p
                        className="ni-serif text-[clamp(3rem,6vw,5rem)] leading-none"
                        style={{ color: "rgba(169,138,92,0.75)" }}
                      >
                        {story.yearLabel ?? story.storyDate}
                      </p>
                    ) : null}

                    <h3 className="ni-display mt-3 text-[clamp(1.5rem,3.2vw,2.15rem)]">
                      {story.title}
                    </h3>

                    {story.description ? (
                      <p
                        className={`ni-body mt-4 text-[0.92rem] ${textRight ? "" : "md:ml-auto"} max-w-[46ch]`}
                      >
                        {story.description}
                      </p>
                    ) : null}
                  </div>
                </Reveal>

                {story.imageUrl ? (
                  <Reveal
                    variant="mask"
                    delay={0.1}
                    className={`mt-6 md:row-start-1 md:col-span-5 md:mt-0 ${
                      textRight ? "md:col-start-1 md:order-1" : "md:col-start-8"
                    }`}
                  >
                    <div className="ni-photo-wrap aspect-[3/2] w-full">
                      
                      <EditorialImage
                        src={story.imageUrl}
                        alt=""
                        
                        className="ni-photo"
                      />
                    </div>
                  </Reveal>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
