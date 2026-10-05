import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TemurayaMark } from "@/components/brand/temuraya-mark";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAdmin } from "@/server/auth/current-admin";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[#f4f5f1] text-[#17201b] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(30rem,0.82fr)]">
      <section
        aria-label="Tentang ruang admin"
        className="relative hidden min-h-svh overflow-hidden bg-[#1f2b25] px-12 py-10 text-[#f4f5f1] lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-24 h-[28rem] w-[22rem] rounded-t-full border border-white/10" />
          <div className="absolute -right-10 top-40 h-[28rem] w-[22rem] rounded-t-full border border-white/10" />
          <div className="absolute bottom-28 left-0 h-px w-2/3 bg-white/10" />
        </div>

        <div className="relative flex items-center gap-3">
          <TemurayaMark tone="light" className="h-11" />
          <div>
            <p className="text-sm font-medium">Temuraya</p>
            <p className="text-xs text-white/55">Ruang kerja pengelola</p>
          </div>
        </div>

        <div className="relative max-w-xl pb-10">
          <p className="max-w-lg text-[clamp(2.7rem,4.2vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.055em]">
            Kelola setiap detail dengan tenang.
          </p>
          <p className="mt-7 max-w-md text-base leading-7 text-white/65">
            Satu ruang kerja untuk menyusun konten, mengatur tamu, memantau respons,
            dan menerbitkan undangan.
          </p>

          <div className="mt-12 grid max-w-lg grid-cols-3 border-y border-white/15 py-5 text-sm text-white/60">
            <span>Susun</span>
            <span className="border-x border-white/15 px-5">Kelola</span>
            <span className="pl-5">Terbitkan</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <TemurayaMark className="h-10" />
            <span className="text-sm font-medium">Temuraya</span>
          </div>

          <p className="text-sm font-medium text-[#53634e]">Ruang admin</p>
          <h1 className="mt-3 text-[clamp(2.25rem,7vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
            Masuk untuk mengelola undangan
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#59625d]">
            Gunakan akun admin yang sudah terdaftar untuk melanjutkan ke dashboard.
          </p>

          <Card className="mt-9 rounded-2xl bg-white py-6 shadow-[0_24px_70px_rgba(23,32,27,0.08)] ring-[#17201b]/10">
            <CardContent className="px-6 sm:px-7">
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-6 text-xs leading-5 text-[#747c77]">
            Akses terbatas untuk pengelola. Aktivitas akun dilindungi oleh autentikasi
            dan sesi aman.
          </p>
        </div>
      </section>
    </main>
  );
}
