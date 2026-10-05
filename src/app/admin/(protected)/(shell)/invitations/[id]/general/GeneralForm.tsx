"use client";

import {
  INVITATION_TIME_ZONE_KEYS,
  INVITATION_TIME_ZONES,
  resolveInvitationTimeZone,
} from "@/lib/invitations/time-zones";
import { INVITATION_TYPE_LABELS, INVITATION_TYPES, invitationTypeLabel } from "@/lib/invitations/types";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { FieldGrid, Panel, PanelBody, PanelFooter, SettingsSection } from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";

import { updateGeneralAction } from "./actions";

/** Identity, theme, date and place: one form split over two settings groups. */
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
    <form action={updateGeneralAction}>
      <input type="hidden" name="invitationId" value={invitation.id} />

      <SettingsSection
        id="identity"
        title="Identitas undangan"
        description="Judul tampil di tab browser dan di banner saat link dibagikan. Alamat URL jadi bagian link yang dikirim ke tamu."
      >
        <FormMessage tone="error">{error}</FormMessage>
        <FormMessage tone="success">{!error && saved ? "Perubahan tersimpan." : null}</FormMessage>
        <Panel>
          <PanelBody>
            <FieldGrid>
              <FormField id="title" label="Judul" className="sm:col-span-2">
                <Input id="title" name="title" defaultValue={invitation.title} required />
              </FormField>
              <FormField
                id="slug"
                label="Alamat URL"
                hint="Huruf kecil, angka dan tanda hubung. Mengubahnya membuat link lama tidak berlaku."
                className="sm:col-span-2"
              >
                <div className="flex h-10 items-stretch overflow-hidden rounded-[10px] border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
                  <span className="flex items-center border-r border-border bg-muted/60 px-3 font-mono text-xs text-muted-foreground">
                    /
                  </span>
                  <input
                    id="slug"
                    name="slug"
                    defaultValue={invitation.slug}
                    required
                    autoCapitalize="none"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
                  />
                </div>
              </FormField>
              <FormField id="type" label="Jenis acara">
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
              </FormField>
              <FormField id="themeId" label="Tema">
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
              </FormField>
            </FieldGrid>
          </PanelBody>
          <PanelFooter>
            <span className="mr-auto text-xs text-muted-foreground">Disimpan bersama Waktu &amp; tempat.</span>
            <SubmitButton variant="outline">Simpan</SubmitButton>
          </PanelFooter>
        </Panel>
      </SettingsSection>

      <SettingsSection
        id="schedule"
        title="Waktu & tempat"
        description="Tanggal utama dipakai untuk hitung mundur dan masa berlaku. Jam setiap acara diisi di bagian Acara."
      >
        <Panel>
          <PanelBody>
            <FieldGrid>
              <FormField id="eventDate" label="Tanggal acara">
                <Input id="eventDate" name="eventDate" type="date" defaultValue={invitation.event_date ?? ""} />
              </FormField>
              <FormField
                id="timeZone"
                label="Zona waktu acara"
                hint="Label di undangan, hitung mundur dan kalender tamu mengikuti zona ini."
              >
                <Select name="timeZone" defaultValue={resolveInvitationTimeZone(invitation.settings)}>
                  <SelectTrigger id="timeZone" className="w-full">
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
              </FormField>
              <FormField id="venueSummary" label="Ringkasan lokasi" hint="Contoh: Pendopo Ndalem, Surakarta." className="sm:col-span-2">
                <Input id="venueSummary" name="venueSummary" defaultValue={invitation.venue_summary ?? ""} />
              </FormField>
            </FieldGrid>
          </PanelBody>
          <PanelFooter>
            <UnsavedHint />
            <SubmitButton>Simpan</SubmitButton>
          </PanelFooter>
        </Panel>
      </SettingsSection>
    </form>
  );
}
