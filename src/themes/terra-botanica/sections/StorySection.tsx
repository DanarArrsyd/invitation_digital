import type { InvitationStory } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { TypedText } from "../components/TypedText";

export function StorySection({ stories }: { stories: InvitationStory[] }) {
  if (stories.length === 0) return null;
  return (
    <Section id="tb-cerita" labelledBy="tb-story-heading" tone="bone" className="tb-story">
      <SectionHeading id="tb-story-heading" title="Cerita kita" />
      <ol className="tb-story-entries">
        {stories.map((story) => {
          const date = story.storyDate ? new Date(`${story.storyDate}T12:00:00Z`) : null;
          const dateLabel = date && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date)
            : null;
          return (
            <li key={story.id} className={`tb-story-entry${story.imageUrl ? "" : " tb-story-text-only"}`}>
              {story.imageUrl ? <EditorialImage src={story.imageUrl} alt={`Kenangan ${story.title}`} sizes="(min-width: 1360px) 620px, (min-width: 768px) 48vw, 88vw" aspectRatio="4 / 3" /> : null}
              <div className="tb-story-copy">
                {story.yearLabel?.trim() ? <p className="tb-story-date"><TypedText text={story.yearLabel} /></p> : dateLabel ? <time className="tb-story-date" dateTime={story.storyDate ?? undefined}><TypedText text={dateLabel} /></time> : null}
                <h3>{story.title}</h3>
                {story.description?.trim() ? <p className="tb-story-description">{story.description}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
