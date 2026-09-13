import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteEventAction, upsertEventAction } from "./actions";

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, events } = detail;

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {events.map((event) => (
        <form
          key={event.id}
          action={upsertEventAction}
          className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="invitationId" value={invitation.id} />
          <input type="hidden" name="sortOrder" value={event.sort_order} />

          <div className="flex flex-col gap-2">
            <Label>Event type</Label>
            <Input name="eventType" defaultValue={event.event_type ?? ""} placeholder="akad, reception..." />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input name="title" defaultValue={event.title} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <Input name="eventDate" type="date" defaultValue={event.event_date} required />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Label>Start time</Label>
              <Input name="startTime" type="time" defaultValue={event.start_time ?? ""} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label>End time</Label>
              <Input name="endTime" type="time" defaultValue={event.end_time ?? ""} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Venue name</Label>
            <Input name="venueName" defaultValue={event.venue_name ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Address</Label>
            <Input name="address" defaultValue={event.address ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Maps URL</Label>
            <Input name="mapsUrl" defaultValue={event.maps_url ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Livestream URL</Label>
            <Input name="livestreamUrl" defaultValue={event.livestream_url ?? ""} />
          </div>

          <div className="col-span-2 flex gap-2">
            <Button type="submit" className="w-fit">
              Save
            </Button>
            <Button
              type="submit"
              formAction={deleteEventAction}
              variant="destructive"
              className="w-fit"
            >
              Delete
            </Button>
          </div>
        </form>
      ))}

      <form
        action={upsertEventAction}
        className="grid max-w-2xl grid-cols-2 gap-3 rounded-lg border border-dashed border-neutral-300 p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={events.length} />

        <div className="flex flex-col gap-2">
          <Label>Event type</Label>
          <Input name="eventType" placeholder="akad, reception..." />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Input name="eventDate" type="date" required />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Start time</Label>
            <Input name="startTime" type="time" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label>End time</Label>
            <Input name="endTime" type="time" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Venue name</Label>
          <Input name="venueName" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Address</Label>
          <Input name="address" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Maps URL</Label>
          <Input name="mapsUrl" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Livestream URL</Label>
          <Input name="livestreamUrl" />
        </div>

        <Button type="submit" className="col-span-2 w-fit">
          Add event
        </Button>
      </form>
    </div>
  );
}
