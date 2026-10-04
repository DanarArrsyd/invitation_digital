import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import type { DashboardSummary } from "@/server/invitations/dashboard";

/** Forest banner echoing the login page: headline, main actions, key numbers. */
export function DashboardHero({
  counts,
  totals,
}: Pick<DashboardSummary, "counts" | "totals">) {
  const metrics = [
    { label: "Terbit", value: counts.published },
    { label: "Draf", value: counts.draft },
    { label: "RSVP masuk", value: totals.rsvps },
    { label: "Ucapan", value: totals.wishes },
  ];

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="relative isolate overflow-hidden rounded-2xl bg-[#1f2b25] px-6 pt-8 pb-6 text-[#f4f5f1] sm:px-10 sm:pt-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)] sm:h-52">
        <div className="absolute -right-24 -top-10 h-[22rem] w-[17rem] rounded-t-full border border-white/10" />
        <div className="absolute -right-6 top-6 h-[22rem] w-[17rem] rounded-t-full border border-white/10" />
      </div>

      <p className="text-sm text-white/60">
        {counts.total === 0 ? "Belum ada undangan" : `${counts.total} undangan dikelola`}
      </p>
      <h1
        id="dashboard-heading"
        className="mt-2 max-w-xl text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.045em]"
      >
        Kelola setiap undangan dari satu tempat.
      </h1>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/admin/invitations/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f4f5f1] px-5 text-sm font-medium text-[#1f2b25] transition hover:bg-white active:translate-y-px"
        >
          <Plus aria-hidden="true" className="size-4" />
          Undangan baru
        </Link>
        {counts.total > 0 ? (
          <Link
            href="/admin/invitations"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-medium text-white transition hover:bg-white/10 active:translate-y-px"
          >
            Semua undangan
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>

      <dl className="mt-10 grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={
              "flex flex-col-reverse gap-1 py-5 " +
              (index % 2 === 1 ? "border-l border-white/15 pl-5 " : "") +
              (index >= 2 ? "border-t border-white/15 sm:border-t-0 " : "") +
              (index === 2 ? "sm:border-l sm:pl-5" : "")
            }
          >
            <dt className="text-xs text-white/60">{metric.label}</dt>
            <dd className="text-3xl font-medium tracking-[-0.04em] tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
