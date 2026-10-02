import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { getPackageDefinition, type PackageKey } from "@/lib/packages/entitlements";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteEventAction, upsertEventAction } from "./actions";

type EventDefaults = {
  event_type: string | null;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  maps_url: string | null;
  livestream_url: string | null;
};

/** Shared by the edit forms and the "add" form; `idPrefix` keeps ids unique per row. */
function EventFields({ idPrefix, event }: { idPrefix: string; event?: EventDefaults }) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <FormField id={id("eventType")} label="Event type">
        <Input id={id("eventType")} name="eventType" defaultValue={event?.event_type ?? ""} placeholder="akad, reception..." />
      </FormField>
      <FormField id={id("title")} label="Title">
        <Input id={id("title")} name="title" defaultValue={event?.title ?? ""} required />
      </FormField>
      <FormField id={id("eventDate")} label="Date">
        <Input id={id("eventDate")} name="eventDate" type="date" defaultValue={event?.event_date ?? ""} required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id={id("startTime")} label="Start time">
          <Input id={id("startTime")} name="startTime" type="time" defaultValue={event?.start_time ?? ""} />
        </FormField>
        <FormField id={id("endTime")} label="End time">
          <Input id={id("endTime")} name="endTime" type="time" defaultValue={event?.end_time ?? ""} />
        </FormField>
      </div>
      <FormField id={id("venueName")} label="Venue name">
        <Input id={id("venueName")} name="venueName" defaultValue={event?.venue_name ?? ""} />
      </FormField>
      <FormField id={id("address")} label="Address">
        <Input id={id("address")} name="address" defaultValue={event?.address ?? ""} />
      </FormField>
      <FormField id={id("mapsUrl")} label="Maps URL">
        <Input id={id("mapsUrl")} name="mapsUrl" type="url" defaultValue={event?.maps_url ?? ""} />
      </FormField>
      <FormField id={id("livestreamUrl")} label="Livestream URL">
        <Input id={id("livestreamUrl")} name="livestreamUrl" type="url" defaultValue={event?.livestream_url ?? ""} />
      </FormField>
    </>
  );
}

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
  const packageDefinition = getPackageDefinition(invitation.package_key as PackageKey);
  const limitReached = events.length >= packageDefinition.limits.maxEvents;

  return (
    <div className="flex flex-col gap-6">
      <FormMessage tone="error">{error}</FormMessage>
      <p className="text-sm text-muted-foreground">
        {events.length} dari {packageDefinition.limits.maxEvents} acara digunakan · Paket {packageDefinition.label}
      </p>

      {events.map((event, index) => (
        <section key={event.id} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-sm font-medium text-foreground">
              {index + 1}. {event.title}
            </h2>
            <ConfirmDeleteForm
              action={deleteEventAction}
              hiddenFields={{ id: event.id, invitationId: invitation.id }}
              title="Hapus acara ini?"
              description={`"${event.title}" akan dihapus dari undangan. Tindakan ini tidak bisa dibatalkan.`}
              triggerLabel="Delete"
            />
          </div>

          <form action={upsertEventAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={event.sort_order} />

            <EventFields idPrefix={`event-${event.id}`} event={event} />

            <SubmitButton className="w-fit sm:col-span-2">Save</SubmitButton>
          </form>
        </section>
      ))}

      <form
        action={upsertEventAction}
        className="grid max-w-2xl gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={events.length} />

        <fieldset disabled={limitReached} className="grid gap-3 border-0 p-0 sm:col-span-2 sm:grid-cols-2">
          <EventFields idPrefix="event-new" />
        </fieldset>

        {limitReached ? (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Batas acara paket tercapai. Hapus acara atau upgrade paket.
          </p>
        ) : (
          <SubmitButton className="w-fit sm:col-span-2" pendingText="Menambahkan...">
            Add event
          </SubmitButton>
        )}
      </form>
    </div>
  );
}
