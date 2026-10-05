"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile script failed to load"));
      };
      document.head.append(script);
    });
  }
  return scriptPromise;
}

/**
 * Renders Cloudflare Turnstile explicitly every time the form mounts, so it
 * also works when the form appears after the first page load (opening the
 * cover, switching a demo package). Turnstile adds the hidden
 * `cf-turnstile-response` input to the container, inside the form, so the
 * token travels with FormData to the Server Action. Tokens are single-use:
 * the widget resets after each submit so a second message gets a fresh one.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!siteKey || !container) return;

    let widgetId: string | null = null;
    let api: TurnstileApi | null = null;
    let cancelled = false;
    const form = container.closest("form");
    // Runs after React has read the form data for the action.
    const onSubmit = () => window.setTimeout(() => widgetId && api?.reset(widgetId), 0);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        api = turnstile;
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          theme: "light",
          appearance: "always",
          "response-field-name": "cf-turnstile-response",
        });
        form?.addEventListener("submit", onSubmit);
      })
      .catch(() => {
        // The server reports a missing token; nothing else to do here.
      });

    return () => {
      cancelled = true;
      form?.removeEventListener("submit", onSubmit);
      if (widgetId && api) api.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="cf-turnstile" data-sitekey={siteKey} />;
}
