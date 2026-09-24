import type { ComponentType } from "react";

import type { Guest, PublicInvitation } from "./invitation";
import type { ThemeSectionManifest } from "@/themes/section-contract";

export interface ThemeComponentProps {
  invitation: PublicInvitation;
  guest: Guest | null;
}

export interface ThemeDefinition {
  component: ComponentType<ThemeComponentProps>;
  category: "wedding" | "birthday" | "engagement" | "aqiqah" | "graduation" | "corporate";
  preview: {
    name: string;
    palette: readonly [string, string, string];
  };
  sections: ThemeSectionManifest;
}

export type ThemeRegistry = Record<string, ThemeDefinition>;
