import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Temuraya Admin",
    template: "%s | Temuraya Admin",
  },
  description: "Ruang kerja privat untuk mengelola undangan digital.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
