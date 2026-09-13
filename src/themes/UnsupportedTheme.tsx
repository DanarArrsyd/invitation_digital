export function UnsupportedTheme({ themeSlug }: { themeSlug: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-50 px-6 text-center">
      <p className="text-sm text-neutral-500">
        Theme &ldquo;{themeSlug}&rdquo; is not available yet.
      </p>
    </main>
  );
}
