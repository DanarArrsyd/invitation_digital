"use client";

import { useActionState, useState } from "react";

import { INVITATION_TYPE_LABELS, INVITATION_TYPES, invitationTypeLabel } from "@/lib/invitations/types";
import { FormMessage } from "@/components/admin/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Alamat URL</Label>
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Jenis acara</Label>
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="themeId">Tema</Label>
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="packageKey">Paket</Label>
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
      </div>

      <FormMessage tone="error">{state.error}</FormMessage>

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending ? "Membuat..." : "Buat undangan"}
      </Button>
    </form>
  );
}
