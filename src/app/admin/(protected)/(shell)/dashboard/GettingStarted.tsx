import Link from "next/link";

const STEPS = [
  {
    title: "Buat undangan",
    body: "Pilih jenis acara, tema, dan paket. Semuanya masih bisa diubah nanti.",
  },
  {
    title: "Isi data dan foto",
    body: "Mempelai, acara, galeri, dan rekening hadiah. Pratinjau tersedia di setiap langkah.",
  },
  {
    title: "Terbitkan dan bagikan",
    body: "Cek daftar kesiapan, terbitkan, lalu kirim link personal ke tiap tamu.",
  },
] as const;

/** Shown on the dashboard while no invitation exists yet. */
export function GettingStarted() {
  return (
    <section aria-labelledby="start-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 id="start-heading" className="text-lg font-semibold tracking-[-0.02em]">
        Mulai dari undangan pertama
      </h2>
      <ol className="mt-6 grid gap-6 md:grid-cols-3 md:gap-0">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4 md:flex-col md:gap-3 md:border-l md:border-border md:px-6 md:first:border-l-0 md:first:pl-0">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1f2b25] text-sm font-medium text-[#f4f5f1]"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href="/admin/invitations/new"
        className="mt-8 inline-flex h-11 items-center rounded-xl bg-[#1f2b25] px-5 text-sm font-medium text-[#f4f5f1] transition hover:bg-[#34443b] active:translate-y-px"
      >
        Buat undangan pertama
      </Link>
    </section>
  );
}
