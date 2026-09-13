import type { ComponentType } from "react";

import type { Guest, PublicInvitation } from "./invitation";

export interface ThemeComponentProps {
  invitation: PublicInvitation;
  guest: Guest | null;
}

export interface ThemeDefinition {
  component: ComponentType<ThemeComponentProps>;
  category: "wedding" | "birthday" | "engagement" | "aqiqah" | "graduation" | "corporate";
}

export type ThemeRegistry = Record<string, ThemeDefinition>;
