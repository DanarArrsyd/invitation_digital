import {
  CalendarDays,
  Gift,
  Images,
  type LucideIcon,
  MessageSquareHeart,
  NotebookPen,
  Rocket,
  Settings2,
  ToggleRight,
  UserRound,
  Users,
} from "lucide-react";

export type EditorSection = { slug: string; label: string; icon: LucideIcon };

/** Invitation editor sections, grouped the way the sidebar shows them. */
export const EDITOR_GROUPS: { label: string; sections: EditorSection[] }[] = [
  {
    label: "Konten",
    sections: [
      { slug: "general", label: "Umum", icon: Settings2 },
      { slug: "people", label: "Mempelai", icon: UserRound },
      { slug: "events", label: "Acara", icon: CalendarDays },
      { slug: "content", label: "Teks & Cerita", icon: NotebookPen },
      { slug: "features", label: "Fitur", icon: ToggleRight },
    ],
  },
  {
    label: "Media & Hadiah",
    sections: [
      { slug: "gallery", label: "Galeri", icon: Images },
      { slug: "gifts", label: "Rekening Hadiah", icon: Gift },
    ],
  },
  {
    label: "Tamu & Respons",
    sections: [
      { slug: "guests", label: "Tamu", icon: Users },
      { slug: "responses", label: "RSVP & Ucapan", icon: MessageSquareHeart },
    ],
  },
  {
    label: "Publikasi",
    sections: [{ slug: "publish", label: "Publikasi", icon: Rocket }],
  },
];

export const EDITOR_SECTIONS: EditorSection[] = EDITOR_GROUPS.flatMap((group) => group.sections);

/** `/admin/invitations/<id>/<section>` → its id, unless it is the "new" form. */
export function editingInvitationId(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/invitations\/([^/]+)(?:\/|$)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}
