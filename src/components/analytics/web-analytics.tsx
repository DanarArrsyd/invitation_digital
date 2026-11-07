"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Query parameters that identify a guest; never sent to analytics. */
const PRIVATE_PARAMS = ["guest", "to"];

/**
 * Vercel Web Analytics for every route except admin. Guest tokens and names
 * in invitation links are removed before an event leaves the browser; UTM
 * parameters are kept so promotion channels can be compared.
 */
export function redactAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return null;
  for (const name of PRIVATE_PARAMS) url.searchParams.delete(name);
  return { ...event, url: url.toString() };
}

export function WebAnalytics() {
  return <Analytics beforeSend={redactAnalyticsEvent} />;
}
