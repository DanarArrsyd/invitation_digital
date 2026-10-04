import { CircleCheck, Clock3, PencilLine, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { daysUntil, formatDay } from "@/components/admin/format";
import type { AttentionItem, AttentionReason } from "@/server/invitations/dashboard";

const REASONS: Record<
  AttentionReason,
  { icon: LucideIcon; action: string; section: string; tone: string }
> = {
  expiring: { icon: Clock3, action: "Atur masa aktif", section: "publish", tone: "bg-[#f7e3dd] text-[#8a3324]" },
  draft: { icon: PencilLine, action: "Cek kesiapan", section: "publish", tone: "bg-[#f6efdc] text-[#6a5220]" },
  no_guests: { icon: UserPlus, action: "Tambah tamu", section: "guests", tone: "bg-[#e3ede0] text-[#24452b]" },
};

function describe({ reason, invitation }: AttentionItem): string {
  if (reason === "expiring" && invitation.expiresAt) {
    const days = daysUntil(invitation.expiresAt);
    return `Berakhir ${formatDay(invitation.expiresAt)}, ${days} hari lagi.`;
  }
  if (reason === "draft") return "Belum diterbitkan. Lengkapi data lalu terbitkan.";
  return "Sudah terbit, tapi belum ada tamu dengan link personal.";
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <section aria-labelledby="attention-heading">
      <h2 id="attention-heading" className="text-lg font-semibold tracking-[-0.02em]">
        Perlu ditindaklanjuti
      </h2>

      {items.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-[#3f6b47]" />
          Semua undangan aman. Tidak ada yang perlu ditindaklanjuti.
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => {
            const { icon: Icon, action, section, tone } = REASONS[item.reason];
            return (
              <li
                key={`${item.reason}-${item.invitation.id}`}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon aria-hidden="true" className="size-[1.1rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={item.invitation.title}>
                    {item.invitation.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{describe(item)}</p>
                  <Link
                    href={`/admin/invitations/${item.invitation.id}/${section}`}
                    className="mt-3 inline-flex text-sm font-medium text-[#3f5a45] underline-offset-4 hover:underline"
                  >
                    {action}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
