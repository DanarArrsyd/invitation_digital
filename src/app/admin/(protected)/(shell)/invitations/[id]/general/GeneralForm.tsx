"use client";

import {
  INVITATION_TIME_ZONE_KEYS,
  INVITATION_TIME_ZONES,
  resolveInvitationTimeZone,
} from "@/lib/invitations/time-zones";
import { INVITATION_TYPE_LABELS, INVITATION_TYPES, invitationTypeLabel } from "@/lib/invitations/types";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";

import { updateGeneralAction } from "./actions";

export function GeneralForm({
  invitation,
  themes,
  error,
  saved,
}: {
  invitation: Tables<"invitations">;
  themes: Tables<"themes">[];
  error?: string;
  saved?: string;
}) {
  return (
    <form action={updateGeneralAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="invitationId" value={invitation.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" name="title" defaultValue={invitation.title} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Alamat URL</Label>
        <Input id="slug" name="slug" defaultValue={invitation.slug} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Jenis acara</Label>
        <Select name="type" defaultValue={invitation.type}>
          <SelectTrigger id="type" className="w-full">
            <SelectValue>{(value: string) => invitationTypeLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {INVITATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {INVITATION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="themeId">Tema</Label>
        <Select name="themeId" defaultValue={invitation.theme_id}>
          <SelectTrigger id="themeId" className="w-full">
            <SelectValue>
              {(value: string) => themes.find((t) => t.id === value)?.name ?? "Pilih tema"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {themes.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="eventDate">Tanggal acara</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          defaultValue={invitation.event_date ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="timeZone">Zona waktu acara</Label>
        <Select name="timeZone" defaultValue={resolveInvitationTimeZone(invitation.settings)}>
          <SelectTrigger id="timeZone" className="w-full" aria-describedby="timeZone-hint">
            <SelectValue>
              {(value: string) => INVITATION_TIME_ZONES[value as keyof typeof INVITATION_TIME_ZONES]?.label ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {INVITATION_TIME_ZONE_KEYS.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {INVITATION_TIME_ZONES[zone].label} — {INVITATION_TIME_ZONES[zone].region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p id="timeZone-hint" className="text-xs text-muted-foreground">
          Jam acara diisi dalam zona ini. Label di undangan, hitung mundur dan kalender tamu mengikutinya.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="venueSummary">Ringkasan lokasi</Label>
        <Input
          id="venueSummary"
          name="venueSummary"
          defaultValue={invitation.venue_summary ?? ""}
        />
      </div>

      <FormMessage tone="error">{error}</FormMessage>
      <FormMessage tone="success">{!error && saved ? "Tersimpan." : null}</FormMessage>

      <SubmitButton className="mt-2 w-fit">Simpan</SubmitButton>
    </form>
  );
}
