# MaCote

A free tool for Quebec cegep students, starting in Quebec City, that tracks a student's real
cote R session over session, shows what each target university program needs, surfaces
bursaries anchored on their own cegep's foundation, and generates a counselor-prep export.

See `docs/00-BUILD-PROMPT.md` for the full build plan and phase-by-phase acceptance checks, and
`docs/SETUP-CLOUD.md` for what's needed to move from local-only scaffolding to a real deploy.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth/Postgres/RLS), deployed on
Vercel, installable as a PWA. A Stripe premium tier is planned (docs Phase 6), not built.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in once a Supabase project exists, see docs/SETUP-CLOUD.md
npm run dev
```

`dev`/`build` pin the webpack bundler rather than Turbopack (Next.js 16's default) — the
`@serwist/next` PWA plugin doesn't support Turbopack yet.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / start |
| `npm run lint` / `typecheck` | ESLint / `next typegen && tsc --noEmit` |
| `npm run check:data` | Cross-reference and guardrail checks on the shipped data (ids, sources, dates, no financial fields) |
| `npm run build:catalog` | Regenerate `supabase/seed/catalog.sql` and `src/lib/data/version.ts` from the TypeScript data |
| `npm run db:local` | Local Postgres 16 bed with the auth shim, every migration and the seed (`scripts/db/local/up.sh`) |
| `npm run test:rls` | Real row-level-security test against `DATABASE_URL` |
| `npm run build:schema` / `check:schema` | Regenerate / verify `supabase/full_schema.sql` from the migrations |
| `npm run gen:types` | Regenerate the `Database` type from the live schema (no Docker) |
| `npm run shots` | Screenshot every screen for every seeded profile state, both locales, phone + desktop |
| `npm run i18n:unused` | List dictionary keys nothing references |
| `npm run collect:sainte-foy` | Push `supabase/seed/sainte-foy/*.json` through the staging pipeline |
| `npm run promote:review` | Diff pending staging rows against production, auto-flag large changes |
| `npm run promote` | Promote human-approved staging rows into production |

## Repo layout

- `src/app` — routes (`(app)` group for the signed-in pages, `onboarding` for the funnel);
  `src/lib/profile` — the local-first profile store, sync and guards; `src/lib/db` — Supabase
  clients + the generated `Database` type; `src/lib/rscore`, `src/lib/matching` — core domain logic
- `scripts/collectors` — HTML/PDF/manual collectors and the staging→production promotion
  pipeline, see `docs/02-scraping-collection-plan.md`
- `supabase/migrations` — schema, one migration per table cluster; `supabase/seed` — hand-
  researched pilot data templates
- `docs` — the product's spec docs, kept in the repo for reference
