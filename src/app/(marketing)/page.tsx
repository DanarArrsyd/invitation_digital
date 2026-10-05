import {
  ClosingSection,
  EventTypesBand,
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowToOrderSection,
  PackagesSection,
  ShowcaseSection,
} from "@/components/marketing/landing-sections";
import { getListedTemplates, getPackageOffers, getSiteSettings } from "@/server/marketing/queries";

export const revalidate = 600;

export default async function LandingPage() {
  const [templates, offers, settings] = await Promise.all([
    getListedTemplates(),
    getPackageOffers(),
    getSiteSettings(),
  ]);
  const available = new Set(templates.flatMap((template) => template.eventTypes));

  return (
    <>
      <HeroSection templates={templates} />
      <EventTypesBand available={available} />
      <ShowcaseSection templates={templates} />
      <HowToOrderSection />
      <FeaturesSection spotlight={templates[0] ?? null} />
      <PackagesSection offers={offers} settings={settings} />
      <FaqSection />
      <ClosingSection settings={settings} />
    </>
  );
}
