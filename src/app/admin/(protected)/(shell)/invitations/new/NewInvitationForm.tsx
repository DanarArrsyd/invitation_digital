"use client";

import { useActionState, useState } from "react";

import { INVITATION_TYPE_LABELS, INVITATION_TYPES, invitationTypeLabel } from "@/lib/invitations/types";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { FieldGrid, Panel, PanelBody, PanelFooter } from "@/components/admin/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PACKAGE_DEFINITIONS, PACKAGE_KEYS } from "@/lib/packages/entitlements";
import { slugify } from "@/lib/utils/slug";
import type { Tables } from "@/types/database";

import { createInvitationAction, type CreateInvitationState } from "./actions";

const initialState: CreateInvitationState = { error: null };

export function NewInvitationForm({ themes }: { themes: Tables<"themes">[] }) {
  const [state, formAction, isPending] = useActionState(createInvitationAction, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="max-w-3xl">
      <Panel>
        <PanelBody>
          <FieldGrid>
            <FormField id="title" label="Judul" hint="Contoh: Pernikahan Ratri & Galih." className="sm:col-span-2">
              <Input
                id="title"
                name="title"
                required
                onChange={(e) => {
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </FormField>

            <FormField id="slug" label="Alamat URL" hint="Terisi otomatis dari judul. Bisa diubah sebelum dibuat." className="sm:col-span-2">
              <div className="flex h-10 items-stretch overflow-hidden rounded-[10px] border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
                <span className="flex items-center border-r border-border bg-muted/60 px-3 font-mono text-xs text-muted-foreground">/</span>
                <input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
                />
              </div>
            </FormField>

            <FormField id="type" label="Jenis acara">
              <Select name="type" defaultValue="wedding">
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
              <Select name="themeId" defaultValue={themes[0]?.id}>
                <SelectTrigger id="themeId" className="w-full">
                  <SelectValue placeholder="Pilih tema">
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

            <FormField id="packageKey" label="Paket" hint="Bisa diganti kapan saja di bagian Umum." className="sm:col-span-2">
              <Select name="packageKey">
                <SelectTrigger id="packageKey" className="w-full">
                  <SelectValue placeholder="Pilih paket" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_KEYS.map((key) => {
                    const definition = PACKAGE_DEFINITIONS[key];
                    return (
                      <SelectItem key={key} value={key}>
                        {definition.label}{definition.recommended ? " — disarankan" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormField>
          </FieldGrid>

          <FormMessage tone="error">{state.error}</FormMessage>
        </PanelBody>
        <PanelFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Membuat..." : "Buat undangan"}
          </Button>
        </PanelFooter>
      </Panel>
    </form>
  );
}
