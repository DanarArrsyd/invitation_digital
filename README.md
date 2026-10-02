# Invitation Digital

Reusable digital invitation platform: an admin backoffice to build, preview and
publish invitations, and themeable public invitation pages with RSVP, wishes,
gifts and guest personalization. The core entity is `invitation`, not
`wedding` — themes are presentation layers over normalized invitation data.

Production: https://invitation-digital-delta.vercel.app

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
shadcn/ui (admin only) · Motion · Supabase (Postgres, Auth, Storage) · Zod ·
Cloudflare Turnstile · Vercel

## Getting started

```bash
npm ci
cp .env.example .env.local   # fill in Supabase + Turnstile keys
npm run dev                  # http://localhost:3000/admin
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Node test runner over `tests/*.test.mjs` |

## Project structure

```text
src/
├── app/
│   ├── (public)/[slug]/   public invitation route, OG images, RSVP/wish actions
│   └── admin/             login + protected backoffice (dashboard, invitation editor)
├── components/
│   ├── admin/             admin-only building blocks
│   └── ui/                shadcn/ui primitives (admin only)
├── themes/
│   ├── registry.ts        slug → theme component + section contract
│   ├── shared/            theme-agnostic helpers and hooks (calendar, view model, forms)
│   └── <theme-slug>/      one folder per theme: sections/, components/, styles
├── server/                server-only domain logic (invitations, media, public)
├── lib/                   supabase clients, validation (Zod), security, utils
├── types/                 domain + generated database types
└── proxy.ts               session refresh + analytics session cookie
supabase/migrations/       schema, RLS and theme catalogue migrations (append-only)
tests/                     node:test suites
docs/                      product, architecture and design documentation
```

## Documentation

Agent and contributor rules live in [`CLAUDE.md`](CLAUDE.md) and
[`AGENTS.md`](AGENTS.md). Everything else is indexed in
[`docs/README.md`](docs/README.md).
