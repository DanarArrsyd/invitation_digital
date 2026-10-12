import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PACKAGE_KEYS } from "@/lib/packages/entitlements";
import { buildQaFixture, QA_CONDITIONS, QA_DEFAULT_GUEST } from "@/lib/qa/fixture-invitation";
import { invitationTypeSchema } from "@/lib/validation/invitation";
import "@/themes/theme-fonts";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../../../../scripts/demo/content.mjs";

/**
 * Local template QA (scripts/qa/matrix.mjs): any template as any package,
 * invitation type and data condition, built from the demo content without
 * Supabase. Production always answers 404.
 */

export const metadata: Metadata = { title: "QA matrix", robots: { index: false, follow: false } };

const querySchema = z.object({
  paket: z.enum(PACKAGE_KEYS).catch("signature"),
  jenis: invitationTypeSchema.catch("wedding"),
  kondisi: z.enum(QA_CONDITIONS).catch("lengkap"),
  to: z.string().trim().min(1).max(80).catch(QA_DEFAULT_GUEST),
});

type QaMatrixPageProps = {
  params: Promise<{ themeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QaMatrixPage({ params, searchParams }: QaMatrixPageProps) {
  if (process.env.NODE_ENV === "production") notFound();

  const { themeSlug } = await params;
  const source = DEMOS.find((demo) => demo.theme === themeSlug);
  if (!source) notFound();

  const query = querySchema.parse(await searchParams);
  const { invitation, guest } = buildQaFixture(
    source,
    { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath },
    {
      packageKey: query.paket,
      type: query.jenis,
      condition: query.kondisi,
      guestName: query.to === "none" ? null : query.to,
    },
  );

  return (
    <>
      <div hidden data-qa-nav-sections={invitation.navSections.join(",")} data-qa-type={invitation.type} />
      <ThemeRenderer invitation={invitation} guest={guest} />
    </>
  );
}
