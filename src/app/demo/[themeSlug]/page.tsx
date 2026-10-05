import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoBar } from "@/components/marketing/demo-bar";
import { isPackageKey, type PackageKey } from "@/lib/packages/entitlements";
import { getDemoInvitation, getListedTemplate, getSiteSettings } from "@/server/marketing/queries";
import "@/themes/theme-fonts";
import { ThemeRenderer } from "@/themes/ThemeRenderer";
import type { Guest } from "@/types/invitation";

type DemoPageProps = {
  params: Promise<{ themeSlug: string }>;
  searchParams: Promise<{ paket?: string; to?: string }>;
};

const DEFAULT_PACKAGE: PackageKey = "signature";
const DEFAULT_GUEST = "Nama Tamu Anda";

/** The cover greets this name, showing how guest personalisation looks. */
function demoGuest(raw: string | undefined): Guest {
  const name = (raw ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return { id: "demo-guest", displayName: name || DEFAULT_GUEST, token: "", notes: null };
}

export async function generateMetadata({ params }: Pick<DemoPageProps, "params">): Promise<Metadata> {
  const template = await getListedTemplate((await params).themeSlug);
  return {
    title: template ? `Demo ${template.name} | Temuraya` : "Demo tidak tersedia | Temuraya",
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { themeSlug } = await params;
  const { paket, to } = await searchParams;
  const packageKey = isPackageKey(paket) ? paket : DEFAULT_PACKAGE;

  const [template, invitation, settings] = await Promise.all([
    getListedTemplate(themeSlug),
    getDemoInvitation(themeSlug, packageKey),
    getSiteSettings(),
  ]);
  if (!template || !invitation) notFound();

  const guest = demoGuest(to);

  return (
    <div>
      <DemoBar
        templateName={template.name}
        themeSlug={themeSlug}
        packageKey={packageKey}
        guestName={guest.displayName}
        settings={settings}
      />
      <ThemeRenderer invitation={invitation} guest={guest} />
    </div>
  );
}
