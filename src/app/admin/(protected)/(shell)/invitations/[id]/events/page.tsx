import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import {
  FieldGrid,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  SettingsSection,
  UsageMeter,
} from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
import { Input } from "@/components/ui/input";
import { formatLongEventDate } from "@/components/admin/format";
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
      <FormField id={id("eventType")} label="Jenis acara">
        <Input id={id("eventType")} name="eventType" defaultValue={event?.event_type ?? ""} placeholder="Akad, resepsi, ..." />
      </FormField>
      <FormField id={id("title")} label="Nama acara">
        <Input id={id("title")} name="title" defaultValue={event?.title ?? ""} required />
      </FormField>
      <FormField id={id("eventDate")} label="Tanggal">
        <Input id={id("eventDate")} name="eventDate" type="date" defaultValue={event?.event_date ?? ""} required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id={id("startTime")} label="Jam mulai">
          <Input id={id("startTime")} name="startTime" type="time" defaultValue={event?.start_time ?? ""} />
        </FormField>
        <FormField id={id("endTime")} label="Jam selesai">
          <Input id={id("endTime")} name="endTime" type="time" defaultValue={event?.end_time ?? ""} />
        </FormField>
      </div>
      <FormField id={id("venueName")} label="Nama tempat">
        <Input id={id("venueName")} name="venueName" defaultValue={event?.venue_name ?? ""} />
      </FormField>
      <FormField id={id("address")} label="Alamat" className="sm:col-span-2">
        <Input id={id("address")} name="address" defaultValue={event?.address ?? ""} />
      </FormField>
      <FormField id={id("mapsUrl")} label="Link Google Maps" hint="Salin dari tombol Bagikan di Google Maps.">
        <Input id={id("mapsUrl")} name="mapsUrl" type="url" defaultValue={event?.maps_url ?? ""} />
      </FormField>
      <FormField id={id("livestreamUrl")} label="Link live streaming" hint="Opsional. Tampil di paket Grand.">
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
    <div className="flex flex-col">
      <FormMessage tone="error" className="mb-2">{error}</FormMessage>

      <SettingsSection
        id="events"
        title="Rangkaian acara"
        description={
          <>
            <p>Setiap acara tampil berurutan di undangan, lengkap dengan peta dan tombol kalender.</p>
            <UsageMeter used={events.length} limit={packageDefinition.limits.maxEvents} unit="acara" />
          </>
        }
      >
        {events.map((event, index) => (
          <Panel key={event.id}>
            <PanelHeader
              index={index + 1}
              title={event.title}
              meta={[event.event_type, formatLongEventDate(event.event_date)].filter(Boolean).join(" · ")}
              actions={
                <ConfirmDeleteForm
                  action={deleteEventAction}
                  hiddenFields={{ id: event.id, invitationId: invitation.id }}
                  title="Hapus acara ini?"
                  description={`"${event.title}" akan dihapus dari undangan. Tindakan ini tidak bisa dibatalkan.`}
                />
              }
            />
            <form action={upsertEventAction}>
              <input type="hidden" name="id" value={event.id} />
              <input type="hidden" name="invitationId" value={invitation.id} />
              <input type="hidden" name="sortOrder" value={event.sort_order} />
              <PanelBody>
                <FieldGrid>
                  <EventFields idPrefix={`event-${event.id}`} event={event} />
                </FieldGrid>
              </PanelBody>
              <PanelFooter>
                <UnsavedHint />
                <SubmitButton>Simpan acara</SubmitButton>
              </PanelFooter>
            </form>
          </Panel>
        ))}

        <Panel className="border-dashed bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] shadow-none">
          <PanelHeader title="Tambah acara" meta={limitReached ? "Batas acara paket ini sudah tercapai" : `Acara ke-${events.length + 1}`} />
          <form action={upsertEventAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={events.length} />
            <PanelBody>
              <fieldset disabled={limitReached} className="grid gap-x-5 gap-y-5 border-0 p-0 sm:grid-cols-2 disabled:opacity-60">
                <EventFields idPrefix="event-new" />
              </fieldset>
            </PanelBody>
            <PanelFooter>
              {limitReached ? (
                <p className="mr-auto text-sm text-muted-foreground">Hapus acara atau naikkan paket untuk menambah.</p>
              ) : (
                <SubmitButton pendingText="Menambahkan...">Tambah acara</SubmitButton>
              )}
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
