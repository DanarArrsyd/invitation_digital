import { NusantaraIvory } from "./nusantara-ivory";
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

export const themeRegistry: ThemeRegistry = {
  "nusantara-ivory": {
    component: NusantaraIvory,
    category: "wedding",
    preview: {
      name: "Nusantara Ivory",
      palette: ["#FCFAF5", "#AA8D61", "#27231F"],
    },
    sections: NUSANTARA_IVORY_SECTIONS,
  },
};
