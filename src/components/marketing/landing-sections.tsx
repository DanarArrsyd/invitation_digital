import {
  ArrowRight,
  CalendarHeart,
  Gift,
  MapPin,
  MessageSquareHeart,
  Music2,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import type { EventType } from "@/lib/marketing/event-types";
import type { MarketingTemplate, PackageOffer, SiteSettings } from "@/server/marketing/queries";

import { ArchMotif } from "./arch-motif";
import { EventTypeChips } from "./event-type-chips";
import { FAQ_ITEMS } from "./faq";
import { OrderLink } from "./order-link";
import { PackageGrid } from "./package-grid";
import { PhoneMockup } from "./phone-mockup";
import { mk } from "./styles";
import { TemplateCard } from "./template-card";

export function HeroSection({ templates }: { templates: MarketingTemplate[] }) {
  const [front, back] = templates;
  return (
    <section aria-labelledby="hero-heading" className="overflow-hidden">
      <div className={`${mk.container} grid items-center gap-12 pt-10 pb-14 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-16 lg:pb-20`}>
        <div className="max-w-xl">
          <h1
            id="hero-heading"
            className="text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.05em] text-balance text-tr-ink"
          >
            Undangan digital untuk setiap perayaan.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-7 text-tr-muted">
            Pilih template, coba demonya, lalu pesan lewat WhatsApp. Kami siapkan sampai link siap dibagikan ke tamu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/template" className={mk.buttonPrimary}>
              Lihat template
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/#cara-pesan" className={mk.buttonSecondary}>
              Cara pesan
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[26rem] justify-center lg:max-w-none">
          <div aria-hidden="true" className="absolute inset-x-6 top-10 bottom-0 rounded-t-full bg-tr-mist" />
          <div className="relative flex w-full items-end justify-center gap-0 pt-6">
            {back ? (
              <PhoneMockup
                src={back.coverUrl}
                alt={`Template ${back.name}`}
                className="relative z-0 -mr-10 mb-8 w-[46%] max-w-[13rem] -rotate-6 sm:-mr-12 lg:max-w-[15rem]"
              />
            ) : null}
            <PhoneMockup
              src={front?.coverUrl ?? null}
              alt={front ? `Template ${front.name}` : "Template segera tersedia"}
              priority
              className="relative z-10 w-[54%] max-w-[15rem] rotate-2 lg:max-w-[17rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventTypesBand({ available }: { available: ReadonlySet<EventType> }) {
  return (
    <section aria-labelledby="acara-heading" className="border-y border-tr-line bg-tr-card/60">
      <div className={`${mk.container} flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-8`}>
        <h2 id="acara-heading" className="shrink-0 text-sm font-medium text-tr-muted">
          Untuk acara
        </h2>
        <EventTypeChips available={available} />
      </div>
    </section>
  );
}

export function ShowcaseSection({ templates }: { templates: MarketingTemplate[] }) {
  return (
    <section aria-labelledby="template-heading" className={`${mk.container} py-16 sm:py-20`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="template-heading" className={mk.sectionTitle}>
            Template pilihan
          </h2>
          <p className={`${mk.lead} mt-3`}>Setiap template punya pembuka, warna, dan interaksi sendiri.</p>
        </div>
        {templates.length > 0 ? (
          <Link href="/template" className={`${mk.textLink} inline-flex items-center gap-1.5 text-sm`}>
            Semua template
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>

      {templates.length > 0 ? (
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {templates.slice(0, 4).map((template) => (
            <li key={template.id} className="flex w-[78%] max-w-[20rem] shrink-0 snap-center sm:w-auto sm:max-w-none">
              <TemplateCard template={template} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-tr-line bg-tr-card px-6 py-10 text-center text-tr-muted">
          Template sedang kami siapkan. Hubungi kami untuk melihat contoh lebih dulu.
        </p>
      )}
    </section>
  );
}

const STEPS = [
  { title: "Pilih template dan paket", body: "Lihat demonya dulu, lalu tekan tombol pesan. WhatsApp terbuka dengan pesan yang sudah terisi." },
  { title: "Kirim data acara", body: "Nama, tanggal, lokasi, foto, rekening hadiah, dan daftar tamu. Bisa dicicil." },
  { title: "Terima link undangan", body: "Cek hasilnya, minta revisi bila perlu, lalu bagikan link personal ke setiap tamu." },
] as const;

export function HowToOrderSection() {
  return (
    <section id="cara-pesan" aria-labelledby="cara-heading" className="scroll-mt-20 bg-tr-card">
      <div className={`${mk.container} py-16 sm:py-20`}>
        <h2 id="cara-heading" className={mk.sectionTitle}>
          Cara pesan
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5 md:flex-col md:gap-4 md:border-l md:border-tr-line md:px-8 md:first:border-l-0 md:first:pl-0">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-tr-forest text-sm font-semibold text-tr-forest"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-tr-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UserRoundCheck, title: "Nama tamu di setiap link", body: "Halaman pembuka menyapa tamu dengan namanya sendiri." },
  { icon: CalendarHeart, title: "RSVP dan hitung mundur", body: "Tamu konfirmasi hadir, lalu simpan tanggal ke kalender HP." },
  { icon: MessageSquareHeart, title: "Ucapan tampil seketika", body: "Doa dan ucapan tamu langsung muncul di undangan." },
  { icon: MapPin, title: "Lokasi satu ketukan", body: "Tombol Maps di setiap acara, tanpa salin alamat." },
  { icon: Music2, title: "Musik latar", body: "Diputar setelah undangan dibuka, dengan tombol jeda." },
  { icon: Gift, title: "Amplop digital", body: "Nomor rekening dengan tombol salin, rapi dan sopan." },
];

export function FeaturesSection({ spotlight }: { spotlight: MarketingTemplate | null }) {
  const image = spotlight?.screenshotUrls[1] ?? spotlight?.coverUrl ?? null;
  return (
    <section aria-labelledby="fitur-heading" className={`${mk.container} py-16 sm:py-20`}>
      <h2 id="fitur-heading" className={mk.sectionTitle}>
        Yang tamu rasakan
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
        <div className="relative col-span-2 flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-2xl bg-tr-forest p-6 text-tr-paper lg:col-span-1 lg:row-span-3 lg:min-h-0">
          <ArchMotif className="-right-10 bottom-0 h-[70%] w-[22rem]" />
          <div className="relative max-w-[18rem]">
            <h3 className="text-xl font-semibold tracking-[-0.02em]">Satu link, semua yang tamu butuhkan</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">Dibuka di HP, tanpa aplikasi, tanpa login.</p>
          </div>
          <div className="relative mt-6 w-[52%] max-w-[12rem] self-end">
            <PhoneMockup src={image} alt={spotlight ? `Template ${spotlight.name}` : "Template segera tersedia"} />
          </div>
        </div>
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-tr-line bg-tr-card p-4 sm:p-5">
            <Icon aria-hidden="true" className="size-5 text-tr-sage" />
            <h3 className="mt-3 text-[0.95rem] leading-snug font-semibold tracking-[-0.01em] sm:mt-4 sm:text-base">{title}</h3>
            <p className="mt-1.5 text-[0.82rem] leading-5 text-tr-muted sm:text-sm sm:leading-6">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PackagesSection({ offers, settings }: { offers: PackageOffer[]; settings: SiteSettings }) {
  return (
    <section id="paket" aria-labelledby="paket-heading" className="scroll-mt-20 border-y border-tr-line bg-tr-mist/50">
      <div className={`${mk.container} py-16 sm:py-20`}>
        <h2 id="paket-heading" className={mk.sectionTitle}>
          Pilih paket
        </h2>
        <p className={`${mk.lead} mt-3`}>Semua template bisa dipakai di paket mana pun. Bedanya ada di jumlah acara, foto, dan fitur.</p>
        <div className="mt-10">
          <PackageGrid offers={offers} settings={settings} />
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={`${mk.container} scroll-mt-20 py-16 sm:py-20`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 id="faq-heading" className={mk.sectionTitle}>
          Pertanyaan yang sering muncul
        </h2>
        <div className="divide-y divide-tr-line border-y border-tr-line">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-tr-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-tr-line text-tr-sage transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-[0.95rem] leading-7 text-tr-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingSection({ settings }: { settings: SiteSettings }) {
  return (
    <section aria-labelledby="penutup-heading" className={`${mk.container} pb-16 sm:pb-20`}>
      <div className="relative overflow-hidden rounded-3xl bg-tr-forest px-6 py-14 text-tr-paper sm:px-12 sm:py-16">
        <ArchMotif className="-right-8 -bottom-10 h-[120%] w-[24rem]" />
        <div className="relative max-w-xl">
          <h2 id="penutup-heading" className="text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
            Siap mengabarkan hari bahagia?
          </h2>
          <p className="mt-4 text-white/70">Ceritakan acaranya, kami bantu pilihkan template dan paket yang pas.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <OrderLink settings={settings} className={mk.buttonOnDark}>
              Pesan via WhatsApp
            </OrderLink>
            <Link
              href="/template"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Lihat template
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
