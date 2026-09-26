# Project Memory

Last updated: 25 September 2026 (Asia/Jakarta)

## Purpose

This is the durable resume checkpoint for the invitation platform. Read it
after `CLAUDE.md` and before continuing the active Terra Botanica plan. The
approved spec and implementation plan remain the source of truth:

- `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md`
- `docs/superpowers/plans/2026-09-24-terra-botanica-theme.md`

## Product decisions that must survive future sessions

- The platform is a reusable invitation product, not a one-off wedding site.
- Packages are named **Intimate**, **Signature**, and **Grand**.
- Package availability and normalized public data stay upstream of themes.
- Every public feature or layout added to one registered theme must be
  represented in **all registered themes** through the canonical typed section
  contract. Presentation may differ; capability parity may not.
- `nusantara-ivory` must remain visually unchanged while Terra is built.
- Terra Botanica uses the approved **Editorial Garden** direction: Fraunces,
  Manrope, Linen/Clay/Moss/Cacao/Sun/Bone, asymmetrical editorial composition,
  restrained custom botanical marks, and no generic SaaS-card styling.
- Sponsorship is only a reserved package entitlement. There is no public
  sponsorship data model or UI in this plan.
- Themes receive normalized data and never query Supabase directly.
- Missing optional data renders nothing or an intentional sparse composition;
  never invent customer data.
- Do not push, deploy, or apply a remote Supabase migration without a separate
  explicit user request.

## Working location and repository state

Active isolated project worktree:

`/Users/ekadanararrasyid/.codex/worktrees/package-entitlements/VS Code/invitation_digital`

The worktree is intentionally detached and externally managed. Do not create
another worktree or move implementation back to the dirty original checkout.
The untracked `supabase/.temp/` directory predates this work; never stage,
delete, or modify it.

Current verified implementation HEAD before this memory checkpoint: `8d301dfa`.

## Completed Terra task history

| Task | Outcome | Commit(s) | Verification/review |
| --- | --- | --- | --- |
| 1 | Added the canonical 18-section theme contract, explicit manifests, and preview metadata. | `fbae86ea` | 76/76 tests; independent review clean. |
| 2 | Extracted pure shared theme view-model and calendar builders; moved ICS timestamp creation to the UI boundary. | `3b639f0c`, `2b7cf69e` | 83/83 tests; one Important purity issue fixed and re-reviewed. |
| 3 | Extracted shared cover/audio/focus/analytics, navigation, public-form, pagination, and clipboard behavior; rewired Ivory without visual changes. | `c570bca0` | 91/91 tests; independent review approved. |
| 4 | Added the unregistered Terra foundation, cover, fonts, tokens, navigation, ornaments, focus and reduced-motion behavior. | `7b711fa9` | 100/100 tests; 320/390/768/1440 checks; review clean. |
| 5 | Added Terra hero, quote, couple/parents, story, gallery, closing, image fallbacks, and sparse states. | `361b3760` | 106/106 tests; four viewport checks; no Critical/Important findings. |
| 6 | Added The Gathering: event details, maps, calendar, countdown, dress code, and livestream. Follow-up fixed invalid calendar intervals, WIB countdown semantics, and four-digit day wrapping. | `4c792f21`, `2b2b3212` | 120/120 tests; focused 15/15; UTC checks 5/5; lint/types and four viewports pass; re-review clean. |
| 7 | Added Terra RSVP, wishes, and digital gifts using shared public-form and clipboard behavior. Follow-up fixed pending-request error recovery so newer edits are never overwritten by a stale submission snapshot. | `a94d9139`, `d964bfaa` | 132/132 tests; task gate 60/60; four viewport/interaction checks; Important race fixed and re-review clean. |
| 8 | Registered Terra in application code, added the idempotent local active-theme upsert, verified all package/theme combinations, and documented parity plus safe rollout/rollback. Two test-only follow-ups hardened exact-write, FK-preservation, and comment-bypass contracts. | `5534560b`, `c319d915`, `8d301dfa` | 139/139 tests; task gate 14/14; lint/types/diff/build pass; Important test gap closed after two scoped re-reviews. |

Terra is now registered in application code. The migration file is committed
but has not been applied to Supabase; therefore live admin discovery is not yet
active or verified.

## Deferred non-blocking review notes

- Task 5: the Terra Instagram link's accessible label should include the
  visible `@username` for stronger voice-control targeting. Keep this as a
  narrow final cleanup for Task 9/final review.
- Task 8: `ARCHITECTURE.md` documents both themes and then shows an older
  abbreviated registry example containing only Ivory and omitting required
  preview/section fields. Task 9 should update it or label it clearly as an
  abbreviated example.
- Remote Supabase images intentionally retain existing `unoptimized` delivery
  because `next.config.ts` has no narrow remote allowlist. Stable ratios,
  explicit sizes, lazy loading, and error fallbacks are already implemented.
  Revisit optimization only during integration QA with evidence.

## Required execution workflow

Work one task at a time with subagent-driven development:

1. Read the task in the plan, the spec, this checkpoint, and the SDD ledger.
2. Dispatch one fresh implementer in the isolated worktree.
3. Require behavioral TDD: prove RED before production code and GREEN after.
4. Run the task-specific gate, full `npm test`, lint, TypeScript, and relevant
   responsive/browser checks.
5. Commit only that task.
6. Generate a review package and dispatch an independent reviewer.
7. Fix every Critical or Important finding and request scoped re-review.
8. Update the SDD ledger and this checkpoint when the durable state changes.
9. Stop and confirm with the user before starting the next numbered task.

Tests must exercise exported/runtime/render behavior. Source-string grep alone
does not prove a feature works. Do not perform unrelated refactors.

The ignored execution ledger is at:

`/Users/ekadanararrasyid/.codex/worktrees/package-entitlements/VS Code/.superpowers/sdd/2026-09-24-terra-botanica-theme/progress.md`

## Resolved review notes

- Task 3's deferred cross-theme hook-integration gap is closed. Task 7 mounts
  the real Terra and Ivory RSVP/wish components through the shared hooks and
  verifies action payloads, pagination, state feedback, input recovery, and
  pending-edit concurrency behavior.

## Next task — Task 9

- Add Terra quality-contract tests and fix only evidenced defects.
- Validate 320×568, 390×844, 768×1024, and 1440×900 for both themes,
  including long text, one/maximum events, sparse/full gallery, disabled
  features/music, reduced motion, expired routing, and slow images.
- Confirm Ivory remains visually unchanged.
- Run `git diff --check`, full tests, lint, TypeScript, and production build.
- Request a whole-branch review against the plan/spec, resolve all Critical and
  Important findings, and report the exact commit range and counts.
- Planned commit: `test(theme): verify terra responsive quality`.
- After final approval, use the branch-finishing workflow. Push, migration, and
  deployment still require explicit user authorization.
