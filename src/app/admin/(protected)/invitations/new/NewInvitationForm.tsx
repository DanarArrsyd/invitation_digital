"use client";

import { useActionState, useState } from "react";

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
import { slugify } from "@/lib/utils/slug";
import type { Tables } from "@/types/database";

import { createInvitationAction, type CreateInvitationState } from "./actions";

const initialState: CreateInvitationState = { error: null };

const INVITATION_TYPES = [
  "wedding",
  "birthday",
  "engagement",
  "aqiqah",
  "graduation",
  "corporate",
] as const;

export function NewInvitationForm({ themes }: { themes: Tables<"themes">[] }) {
  const [state, formAction, isPending] = useActionState(createInvitationAction, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
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
        <Label htmlFor="slug">Slug</Label>
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
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="wedding">
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INVITATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="themeId">Theme</Label>
        <Select name="themeId" defaultValue={themes[0]?.id}>
          <SelectTrigger id="themeId" className="w-full">
            <SelectValue placeholder="Select a theme">
              {(value: string) => themes.find((t) => t.id === value)?.name ?? "Select a theme"}
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

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending ? "Creating..." : "Create Invitation"}
      </Button>
    </form>
  );
}
