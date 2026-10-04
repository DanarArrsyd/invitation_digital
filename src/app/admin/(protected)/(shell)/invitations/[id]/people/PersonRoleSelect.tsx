"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isPersonRole, normalizePersonRole, PERSON_ROLE_LABELS, PERSON_ROLES } from "@/lib/invitations/person-role";

/** Fixed choices: themes key parent labels ("Putra dari") off the exact role. */
export function PersonRoleSelect({ id, defaultValue }: { id: string; defaultValue?: string }) {
  const normalized = defaultValue ? normalizePersonRole(defaultValue) : "";
  return (
    <Select name="role" defaultValue={isPersonRole(normalized) ? normalized : undefined} required>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Pilih peran">
          {(value: string) => (isPersonRole(value) ? PERSON_ROLE_LABELS[value] : "Pilih peran")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PERSON_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {PERSON_ROLE_LABELS[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
