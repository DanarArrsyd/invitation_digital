import { NusantaraIvory } from "./nusantara-ivory";
import { TerraBotanica } from "./terra-botanica";
import { MidnightAtelier, MIDNIGHT_ATELIER_SECTIONS } from "./midnight-atelier";
import { CobaltRiviera, COBALT_RIVIERA_SECTIONS } from "./cobalt-riviera";
import { defineThemeSectionManifest } from "./section-contract";
import type { ThemeRegistry } from "@/types/theme";

export const NUSANTARA_IVORY_SECTIONS = defineThemeSectionManifest({
  cover: true,
  hero: true,
  quote: true,
  couple: true,
  parents: true,
  events: true,
  countdown: true,
  maps: true,
  calendar: true,
  dressCode: true,
  story: true,
  gallery: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  instagram: true,
  closing: true,
});

export const TERRA_BOTANICA_SECTIONS = defineThemeSectionManifest({
  cover: true,
  hero: true,
  quote: true,
  couple: true,
  parents: true,
  events: true,
  countdown: true,
  maps: true,
  calendar: true,
  dressCode: true,
  story: true,
  gallery: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  instagram: true,
  closing: true,
});

export const themeRegistry: ThemeRegistry = {
  "cobalt-riviera": {
    component: CobaltRiviera,
    category: "wedding",
    preview: {
      name: "Cobalt Riviera",
      palette: ["#1646C8", "#FFF9EE", "#F06A3C"],
    },
    sections: COBALT_RIVIERA_SECTIONS,
  },
  "nusantara-ivory": {
    component: NusantaraIvory,
    category: "wedding",
    preview: {
      name: "Nusantara Ivory",
      palette: ["#F8F1E4", "#A87A3D", "#6B3E26"],
    },
    sections: NUSANTARA_IVORY_SECTIONS,
  },
  "terra-botanica": {
    component: TerraBotanica,
    category: "wedding",
    preview: {
      name: "Terra Botanica",
      palette: ["#F2EBDD", "#B5653E", "#4E5B3A"],
    },
    sections: TERRA_BOTANICA_SECTIONS,
  },
  "midnight-atelier": {
    component: MidnightAtelier,
    category: "wedding",
    preview: {
      name: "Midnight Atelier",
      palette: ["#09090B", "#541E2B", "#C6A15B"],
    },
    sections: MIDNIGHT_ATELIER_SECTIONS,
  },
};
