import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { EVENT_TYPE_LABELS } from "@/lib/marketing/event-types";
import type { MarketingTemplate } from "@/server/marketing/queries";

import { PhoneMockup } from "./phone-mockup";

export function TemplateCard({ template, headingLevel = "h3" }: { template: MarketingTemplate; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-tr-line bg-tr-card p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(23,32,27,0.4)] sm:p-5">
      <div className="rounded-xl bg-tr-mist px-[18%] pt-6 pb-0">
        <PhoneMockup src={template.coverUrl} alt={`Tampilan template ${template.name}`} className="rounded-b-none border-b-0" />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <Heading className="text-lg font-semibold tracking-[-0.02em] text-tr-ink">
          <Link href={`/template/${template.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
            {template.name}
          </Link>
        </Heading>
        {template.tagline ? <p className="mt-1 text-sm leading-6 text-tr-muted">{template.tagline}</p> : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.eventTypes.map((type) => (
            <span key={type} className="rounded-full bg-tr-mist px-2.5 py-1 text-xs font-medium text-tr-sage">
              {EVENT_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-medium">
          <span className="text-tr-ink">{template.hasDemo ? "Lihat detail & demo" : "Lihat detail"}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-tr-sage transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </article>
  );
}
