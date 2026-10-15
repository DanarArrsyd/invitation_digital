# Error Monitoring — Design

**Date:** 2026-10-15
**Phase:** 9, sub-project 1
**Status:** Implemented on feature branch; production activation pending owner setup and merge

## Problem

Temuraya currently discovers browser failures only through manual QA or guest reports. Vercel runtime logs cover server requests, but the project's plan may retain them briefly, and Vercel anomaly alerts require a paid add-on. The previous public hydration issue is an example of a failure that server logs alone would miss.

## Decision

Use Sentry for uncaught browser and server errors. Keep Vercel runtime logs for request-level diagnosis. Scope this first version to error events: no session replay, tracing, performance profiles, user identity, form payloads, query strings, breadcrumbs, or automatic feedback capture. A DSN is required to activate event delivery; with no DSN the application still builds and works normally.

SDK data collection for identity, cookies, headers, bodies, query parameters, database values, stack variables, and source context is disabled. Its `beforeSend` removes request, user, breadcrumb, extra, context, tag, transaction, and fingerprint fields, replaces error messages with `[redacted]`, and strips any frame variables or source context. Error type, stack filenames, and line numbers remain for grouping and locating code. This deliberately sacrifices raw error-message detail to avoid sending invitation names, guest names, wishes, tokens, or private admin values to the monitoring provider. Sentry's own project-side data scrubber should also be enabled as a second layer.

## Coverage

- Next.js `onRequestError` captures unexpected errors during App Router rendering, route handlers, actions, and proxy execution.
- Browser SDK captures uncaught client errors, including hydration failures.
- Root error UI gives a clear Indonesian fallback and retry button if the app fails to render.
- Expected validation and Turnstile failures stay normal form states and do not create monitoring noise.
- No database schema, customer data, invitation route, or public form contract changes.

## Activation and acceptance

1. Owner creates a Sentry Next.js project and sets `SENTRY_DSN` plus `NEXT_PUBLIC_SENTRY_DSN` to its DSN in Vercel Production and Preview. The public DSN is an ingestion identifier, not a secret; the auth token stays server/build-only.
2. Configure Sentry's project data scrubber and an email alert for a new issue or regression. Keep event quotas/rate limits within the chosen plan.
3. Optional readable source maps: set `SENTRY_ORG`, `SENTRY_PROJECT`, and build-only `SENTRY_AUTH_TOKEN` with the minimum release upload permission. Builds without that token skip uploading maps.
4. In a protected preview, trigger one controlled browser exception and one server exception, confirm one issue for each, inspect their payloads for personal data, and remove the temporary triggers before merging.
5. After production merge, check an actual request through the new deployment, monitor Sentry issues and Vercel 5xx logs, and record the first operational check.

No synthetic error route is committed or exposed publicly. Monitoring is only considered live after the owner-controlled DSN, alerts, and preview smoke are verified.

## Limits

The first version does not detect failed third-party requests or business operations that return expected error results. Those require deliberate product-level events once alert thresholds and privacy rules are known. Sentry delivery can be blocked by browser extensions; server logs remain the fallback for backend failures.
