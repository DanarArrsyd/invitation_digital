"use client";

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
import type { Tables } from "@/types/database";

import { updateGeneralAction } from "./actions";

const INVITATION_TYPES = [
  "wedding",
  "birthday",
  "engagement",
  "aqiqah",
  "graduation",
  "corporate",
] as const;

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
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={invitation.title} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={invitation.slug} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={invitation.type}>
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
        <Select name="themeId" defaultValue={invitation.theme_id}>
          <SelectTrigger id="themeId" className="w-full">
            <SelectValue>
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="eventDate">Event date</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          defaultValue={invitation.event_date ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="venueSummary">Venue summary</Label>
        <Input
          id="venueSummary"
          name="venueSummary"
          defaultValue={invitation.venue_summary ?? ""}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">Saved.</p> : null}

      <Button type="submit" className="mt-2 w-fit">
        Save
      </Button>
    </form>
  );
}
