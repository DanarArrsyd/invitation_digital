"use client";

import Script from "next/script";

/**
 * Cloudflare's script auto-renders the widget into this div and injects a
 * hidden `cf-turnstile-response` input inside the nearest <form> — no extra
 * JS needed to wire it into FormData / a Server Action.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
