# Error monitoring runbook

## Setup

Create one Sentry project for Temuraya. Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to Vercel Preview and Production with the same DSN. Keep the project in error-only mode: no Replay, tracing, profiling, or user identity collection. Turn on Sentry's server-side data scrubber and set an email alert for new issues and regressions. Review the event limit and notification destination with the owner.

For readable stack frames, add `SENTRY_ORG`, `SENTRY_PROJECT`, and build-only `SENTRY_AUTH_TOKEN` to Vercel. Give the token only the permission needed for source-map upload. Never add it to a `NEXT_PUBLIC_` variable or commit it.

With no DSN, capture is disabled. `npm run typecheck`, lint, tests, and build still run locally.

## Active setup (2026-10-16)

- Sentry organization: `eka-danar-orgs` (US region); project: `javascript-nextjs`.
- Both DSN variables are configured in Vercel Preview and Production. Production capture starts only when the monitoring PR is merged and deployed.
- The project uses default and server-side data scrubbers, with IP storage disabled. An email alert to the organization owner covers new and regressed issues, throttled to once per issue per hour.
- Browser capture and redaction were verified on Preview; server capture and redaction were verified with the production SDK configuration locally. Source-map upload is pending a scoped Sentry auth token.
- The existing Preview Turnstile site key rejects Vercel's per-deployment hostname (`110200`). Do not substitute Cloudflare's always-pass test keys while Preview shares the live Supabase project. Fix hostname authorization or isolate Preview data before testing public form submissions there.

## Triage

1. Check the Sentry issue's first seen time, affected release, exception type, and stack frame. Payload fields such as guest name, invitation URL, form value, raw message, absolute local path, and server hostname should be absent. If any appear, disable the DSN and fix the scrubber before resuming. Sentry can still infer approximate geography from the event's delivery IP even when IP storage is disabled.
2. Correlate the time and route with Vercel Runtime Logs. For server 5xx errors, use `vercel logs --environment production --status-code 5xx --since 1h` from the linked project.
3. Reproduce on a preview using demo or QA fixtures. Never use a real invitation for diagnostic writes.
4. Fix on a branch, run the relevant checks, verify the preview, and request approval before merging to production.
5. Resolve the issue in Sentry only after the production check is green. If the problem recurs, reopen it and compare releases.

## What is intentionally absent

Expected form validation failures are returned to the visitor. Sentry is reserved for unexpected exceptions. The monitoring integration does not include customer identity, session replay, form values, query strings, or browser breadcrumbs.
