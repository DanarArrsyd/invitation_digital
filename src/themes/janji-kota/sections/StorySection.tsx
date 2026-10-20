import type { InvitationStory } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function StorySection({ stories, heading }: { stories: InvitationStory[]; heading: string }) {
  if (stories.length === 0) return null;
  return (
    <Section id="jk-cerita" labelledBy="jk-story-heading" tone="light" className="jk-story">
      <SectionHeading id="jk-story-heading" title={heading} />
      <ol className="jk-story-entries">
        {stories.map((story) => {
          const date = story.storyDate ? new Date(`${story.storyDate}T12:00:00Z`) : null;
          const dateLabel = date && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date)
            : null;
          return (
            <li key={story.id} className={`jk-story-entry${story.imageUrl ? "" : " jk-story-text-only"}`}>
              {story.imageUrl ? <EditorialImage src={story.imageUrl} alt={`Kenangan ${story.title}`} sizes="(min-width: 1360px) 620px, (min-width: 768px) 48vw, 88vw" aspectRatio="4 / 3" /> : null}
              <div className="jk-story-copy">
                {story.yearLabel?.trim() ? <p className="jk-story-date">{story.yearLabel}</p> : dateLabel ? <time className="jk-story-date" dateTime={story.storyDate ?? undefined}>{dateLabel}</time> : null}
                <h3>{story.title}</h3>
                {story.description?.trim() ? <p className="jk-story-description">{story.description}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
