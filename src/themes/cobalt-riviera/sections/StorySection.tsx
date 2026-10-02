import { validEventDate } from "@/themes/shared/calendar";
import type { InvitationStory } from "@/types/invitation";

import { RivieraImage } from "../components/RivieraImage";
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
    <Section id="cr-cerita" labelledBy="cr-story-heading" tone="pool" className="cr-story">
      <header className="cr-story-heading">
        <p>Catatan perjalanan kami</p>
        <h2 id="cr-story-heading">Cerita yang membawa kami ke sini</h2>
      </header>

      <div
        className="cr-story-rail"
        role="region"
        aria-label="Kronologi cerita pasangan"
        tabIndex={0}
      >
        <ol className="cr-story-list">
          {stories.map((story, index) => {
            const dateLabel = storyDateLabel(story.storyDate);
            const yearLabel = story.yearLabel?.trim() || null;

            return (
              <li
                key={story.id}
                data-story-item={story.id}
                data-layout={index % 2 === 0 ? "image-first" : "copy-first"}
                className={`cr-story-entry${story.imageUrl ? "" : " cr-story-text-only"}`}
              >
                {story.imageUrl ? (
                  <RivieraImage
                    src={story.imageUrl}
                    alt={`Kenangan ${story.title}`}
                    sizes="(min-width: 1200px) 42vw, (min-width: 768px) 54vw, 88vw"
                    aspectRatio="4 / 3"
                    className="cr-story-image"
                  />
                ) : null}
                <div className="cr-story-copy">
                  <span className="cr-story-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {yearLabel ? (
                    <p className="cr-story-date">{yearLabel}</p>
                  ) : dateLabel ? (
                    <time className="cr-story-date" dateTime={story.storyDate ?? undefined}>{dateLabel}</time>
                  ) : null}
                  <h3>{story.title}</h3>
                  {story.description?.trim() ? <p className="cr-story-description">{story.description}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
