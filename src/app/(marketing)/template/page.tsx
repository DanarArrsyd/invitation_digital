import type { Metadata } from "next";

import { EventTypeChips } from "@/components/marketing/event-type-chips";
import { OrderLink } from "@/components/marketing/order-link";
import { mk } from "@/components/marketing/styles";
import { TemplateCard } from "@/components/marketing/template-card";
import { EVENT_TYPE_LABELS, isEventType } from "@/lib/marketing/event-types";
import { getListedTemplates, getSiteSettings } from "@/server/marketing/queries";

export const metadata: Metadata = {
  title: "Template undangan",
  description: "Semua template undangan digital Temuraya. Lihat demo setiap template sesuai paket sebelum memesan.",
};

export default async function TemplateCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ acara?: string }>;
}) {
  const { acara } = await searchParams;
  const [templates, settings] = await Promise.all([getListedTemplates(), getSiteSettings()]);
  const active = isEventType(acara) ? acara : null;
  const available = new Set(templates.flatMap((template) => template.eventTypes));
  const shown = active ? templates.filter((template) => template.eventTypes.includes(active)) : templates;

  return (
    <div className={`${mk.container} py-12 sm:py-16`}>
      <h1 className="text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-tr-ink">
        {active ? `Template ${EVENT_TYPE_LABELS[active].toLowerCase()}` : "Template undangan"}
      </h1>
      <p className={`${mk.lead} mt-4`}>
        Buka detail untuk melihat screenshot, fitur tiap paket, dan demo yang bisa dicoba langsung.
      </p>

      <div className="mt-8">
        <EventTypeChips available={available} active={active} includeAll />
      </div>

      {shown.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((template) => (
            <li key={template.id} className="flex">
              <TemplateCard template={template} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-tr-line bg-tr-card px-6 py-12 text-center">
          <p className="font-medium text-tr-ink">
            {active ? `Template ${EVENT_TYPE_LABELS[active].toLowerCase()} segera hadir.` : "Template sedang kami siapkan."}
          </p>
          <p className="mt-2 text-sm text-tr-muted">Ceritakan acara Anda, kami bantu carikan pilihan terdekat.</p>
          <OrderLink
            settings={settings}
            values={{ acara: active ? EVENT_TYPE_LABELS[active] : undefined }}
            className={`${mk.buttonPrimary} mt-6`}
          >
            Tanya lewat WhatsApp
          </OrderLink>
        </div>
      )}
    </div>
  );
}
