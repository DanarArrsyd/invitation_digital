import { validEventDate } from "@/themes/shared/calendar";
import type { InvitationStory } from "@/types/invitation";

import { AtelierImage } from "../components/AtelierImage";
import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";

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
    <Section id="ma-cerita" labelledBy="ma-story-heading" tone="pearl" className="ma-story">
      <Spotlight className="ma-chapter-heading">
        <p>{`${String(stories.length).padStart(2, "0")} babak perjalanan`}</p>
        <h2 id="ma-story-heading">Cerita kami</h2>
      </Spotlight>

      <ol className="ma-story-list">
        {stories.map((story, index) => {
          const dateLabel = storyDateLabel(story.storyDate);
          const yearLabel = story.yearLabel?.trim() || null;
          const textOnly = !story.imageUrl;

          return (
            <li
              key={story.id}
              data-story-item={story.id}
              data-layout={index % 2 === 0 ? "image-right" : "image-left"}
              className={`ma-story-entry${textOnly ? " ma-story-text-only" : ""}`}
            >
              <div className="ma-story-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="ma-story-copy">
                {yearLabel ? (
                  <p className="ma-story-date">{yearLabel}</p>
                ) : dateLabel ? (
                  <time className="ma-story-date" dateTime={story.storyDate ?? undefined}>{dateLabel}</time>
                ) : null}
                <h3>{story.title}</h3>
                {story.description?.trim() ? <p className="ma-story-description">{story.description}</p> : null}
              </div>
              {story.imageUrl ? (
                <AtelierImage
                  src={story.imageUrl}
                  alt={`Kenangan ${story.title}`}
                  sizes="(min-width: 1100px) 48vw, (min-width: 768px) 55vw, 100vw"
                  aspectRatio="3 / 2"
                  className="ma-story-image"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
