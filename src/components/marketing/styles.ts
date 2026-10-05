/** Shared class strings for the marketing site, so buttons look the same everywhere. */
export const mk = {
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
  buttonPrimary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-tr-forest px-5 text-sm font-medium whitespace-nowrap text-tr-paper transition hover:bg-tr-forest-soft focus-visible:ring-3 focus-visible:ring-tr-sage/40 focus-visible:outline-none active:translate-y-px",
  buttonSecondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-tr-ink/15 bg-tr-card px-5 text-sm font-medium whitespace-nowrap text-tr-ink transition hover:border-tr-ink/30 focus-visible:ring-3 focus-visible:ring-tr-sage/40 focus-visible:outline-none active:translate-y-px",
  buttonOnDark:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-tr-paper px-5 text-sm font-medium whitespace-nowrap text-tr-forest transition hover:bg-white focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none active:translate-y-px",
  textLink: "font-medium text-tr-sage underline-offset-4 hover:text-tr-ink hover:underline",
  sectionTitle: "text-[clamp(1.75rem,3.6vw,2.6rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-tr-ink",
  lead: "max-w-[60ch] text-base leading-7 text-tr-muted",
} as const;
