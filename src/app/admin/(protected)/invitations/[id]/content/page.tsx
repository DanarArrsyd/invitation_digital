import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteStoryAction, updateContentAction, upsertStoryAction } from "./actions";
import { uploadStoryImageAction } from "./media-actions";

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, stories } = detail;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Opening &amp; Closing</h2>
        <form action={updateContentAction} className="mt-4 flex max-w-lg flex-col gap-4">
          <input type="hidden" name="invitationId" value={invitation.id} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="openingQuote">Opening quote</Label>
            <Textarea
              id="openingQuote"
              name="openingQuote"
              defaultValue={invitation.opening_quote ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="openingMessage">Opening message</Label>
            <Textarea
              id="openingMessage"
              name="openingMessage"
              defaultValue={invitation.opening_message ?? ""}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="closingMessage">Closing message</Label>
            <Textarea
              id="closingMessage"
              name="closingMessage"
              defaultValue={invitation.closing_message ?? ""}
              rows={3}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {saved ? <p className="text-sm text-green-600">Saved.</p> : null}

          <Button type="submit" className="mt-2 w-fit">
            Save
          </Button>
        </form>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Love Story</h2>

        <div className="mt-4 flex flex-col gap-4">
          {stories.map((story) => (
            <div key={story.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {story.year_label ?? story.story_date ?? ""} — {story.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{story.description}</p>
                  {story.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaPublicUrl(story.image_path) ?? undefined}
                      alt=""
                      className="mt-2 h-24 w-24 rounded-md object-cover"
                    />
                  ) : null}
                </div>
                <form action={deleteStoryAction}>
                  <input type="hidden" name="id" value={story.id} />
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </div>

              <form action={uploadStoryImageAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <Input type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
                <Button type="submit" variant="outline" size="sm">
                  Upload image
                </Button>
              </form>
            </div>
          ))}

          <form
            action={upsertStoryAction}
            className="grid max-w-lg grid-cols-2 gap-3 rounded-lg border border-dashed border-neutral-300 p-4"
          >
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={stories.length} />

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="storyTitle">Title</Label>
              <Input id="storyTitle" name="title" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="yearLabel">Year label</Label>
              <Input id="yearLabel" name="yearLabel" placeholder="2019" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="storyDate">Date</Label>
              <Input id="storyDate" name="storyDate" type="date" />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>

            <Button type="submit" className="col-span-2 w-fit">
              Add story
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
