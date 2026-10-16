"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#f7f3e9", color: "#19382c", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeContent: "center", padding: 24, textAlign: "center" }}>
          <h1>Halaman belum bisa ditampilkan</h1>
          <p>Silakan coba beberapa saat lagi.</p>
          <button onClick={retry} style={{ minHeight: 44, padding: "8px 20px", cursor: "pointer" }}>
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
