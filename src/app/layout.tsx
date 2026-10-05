import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/lib/marketing/site-url";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Only admin code blocks use it; no need to preload on every route.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Temuraya",
  description: "Undangan digital untuk setiap acara.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
