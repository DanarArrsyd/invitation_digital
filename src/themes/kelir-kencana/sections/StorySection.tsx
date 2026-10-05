import { validEventDate } from "@/themes/shared/calendar";
import type { InvitationStory } from "@/types/invitation";

import { KelirImage } from "../components/KelirImage";
import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

function storyDateLabel(value: string | null): string | null {
  if (!value || !validEventDate(value)) return null;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function StorySection({ stories }: { stories: InvitationStory[] }) {
  if (stories.length === 0) return null;

  return (
    <Section id="kk-cerita" labelledBy="kk-story-heading" className="kk-story">
      <ChapterHeading id="kk-story-heading" eyebrow="Lakon kami" title="Cerita Kami" />

      <ol className="kk-story-list">
        {stories.map((story) => {
          const dateLabel = storyDateLabel(story.storyDate);
          const yearLabel = story.yearLabel?.trim() || null;

          return (
            <li key={story.id} data-story-item={story.id} className={`kk-story-entry${story.imageUrl ? "" : " kk-story-text-only"}`}>
              <div className="kk-story-copy">
                {yearLabel ? (
                  <p className="kk-story-date">{yearLabel}</p>
                ) : dateLabel ? (
                  <time className="kk-story-date" dateTime={story.storyDate ?? undefined}>{dateLabel}</time>
                ) : null}
                <h3>{story.title}</h3>
                {story.description?.trim() ? <p className="kk-story-description">{story.description}</p> : null}
              </div>
              {story.imageUrl ? (
                <KelirImage
                  src={story.imageUrl}
                  alt={`Kenangan ${story.title}`}
                  sizes="(min-width: 768px) 40vw, 86vw"
                  aspectRatio="4 / 3"
                  className="kk-story-image"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
