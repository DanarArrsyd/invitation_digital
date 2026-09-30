import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Invitation Admin",
    template: "%s | Invitation Admin",
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
  return children;
}
