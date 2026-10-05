import type { NextConfig } from "next";

/**
 * Uploaded invitation media is served from the Supabase public bucket.
 * Allowing that origin lets next/image resize it per device instead of
 * shipping the original upload to every phone.
 */
function supabaseMediaPattern(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  const { protocol, hostname } = new URL(url);
  return [
    {
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      pathname: "/storage/v1/object/public/invitation-media/**",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseMediaPattern(),
  },
  // Share banners (src/lib/og) read their fonts and the demo screenshots
  // from disk at runtime; ship them with the functions that render them.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./assets/og-fonts/*.woff", "./public/demo/*/cover.jpg", "./public/demo/*/screen-*.jpg"],
    "/**/twitter-image*": ["./assets/og-fonts/*.woff", "./public/demo/*/cover.jpg"],
  },
};

export default nextConfig;
