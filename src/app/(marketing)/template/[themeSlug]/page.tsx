import { ArrowRight, ChevronLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderLink } from "@/components/marketing/order-link";
import { PackageGrid } from "@/components/marketing/package-grid";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { mk } from "@/components/marketing/styles";
import { TemplateCard } from "@/components/marketing/template-card";
import { EVENT_TYPE_LABELS } from "@/lib/marketing/event-types";
import {
  getListedTemplate,
  getListedTemplates,
  getPackageOffers,
  getSiteSettings,
} from "@/server/marketing/queries";

export const revalidate = 600;

type Params = { params: Promise<{ themeSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const template = await getListedTemplate((await params).themeSlug);
  if (!template) return { title: "Template tidak ditemukan" };
  return {
    title: `Template ${template.name}`,
    description: template.tagline ?? template.description ?? `Template undangan digital ${template.name} dari Temuraya.`,
    openGraph: template.coverUrl ? { images: [{ url: template.coverUrl }] } : undefined,
  };
}

export default async function TemplateDetailPage({ params }: Params) {
  const { themeSlug } = await params;
  const [template, templates, offers, settings] = await Promise.all([
    getListedTemplate(themeSlug),
    getListedTemplates(),
    getPackageOffers(),
    getSiteSettings(),
  ]);
  if (!template) notFound();

  const screenshots = template.screenshotUrls.length > 0 ? template.screenshotUrls : [template.coverUrl];
  const others = templates.filter((item) => item.id !== template.id).slice(0, 3);

  return (
    <>
      <div className={`${mk.container} pt-8 sm:pt-10`}>
        <Link href="/template" className="inline-flex items-center gap-1 text-sm text-tr-muted hover:text-tr-ink">
          <ChevronLeft aria-hidden="true" className="size-4" />
          Semua template
        </Link>
      </div>

      <section aria-labelledby="template-name" className={`${mk.container} grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-14 lg:py-12`}>
        <div className="order-2 lg:order-1">
          <h2 className="sr-only">Screenshot</h2>
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {screenshots.map((src, index) => (
              <li key={src ?? index} className="w-[62%] shrink-0 snap-center sm:w-auto">
                <PhoneMockup
                  src={src}
                  alt={`Tampilan ${index + 1} template ${template.name}`}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2">
          <h1 id="template-name" className="text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.03] font-semibold tracking-[-0.045em] text-tr-ink">
            {template.name}
          </h1>
          {template.tagline ? <p className="mt-3 text-lg text-tr-muted">{template.tagline}</p> : null}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {template.eventTypes.map((type) => (
              <span key={type} className="rounded-full bg-tr-mist px-2.5 py-1 text-xs font-medium text-tr-sage">
                {EVENT_TYPE_LABELS[type]}
              </span>
            ))}
          </div>
          {template.description ? (
            <p className="mt-6 max-w-[60ch] text-[0.98rem] leading-7 whitespace-pre-line text-tr-muted">{template.description}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {template.hasDemo ? (
              <Link href={`/demo/${template.slug}?paket=signature`} className={mk.buttonPrimary}>
                Coba demo
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
            <OrderLink
              settings={settings}
              values={{ template: template.name }}
              className={template.hasDemo ? mk.buttonSecondary : mk.buttonPrimary}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Pesan template ini
            </OrderLink>
          </div>
          {!template.hasDemo ? <p className="mt-4 text-sm text-tr-muted">Demo template ini sedang disiapkan.</p> : null}
        </div>
      </section>

      <section aria-labelledby="paket-template" className="border-y border-tr-line bg-tr-mist/50">
        <div className={`${mk.container} py-14 sm:py-16`}>
          <h2 id="paket-template" className={mk.sectionTitle}>
            Paket untuk {template.name}
          </h2>
          <div className="mt-10">
            <PackageGrid offers={offers} settings={settings} template={template} />
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section aria-labelledby="template-lain" className={`${mk.container} py-14 sm:py-16`}>
          <h2 id="template-lain" className={mk.sectionTitle}>
            Template lain
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.id} className="flex">
                <TemplateCard template={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
