# MaCote

A free tool for Quebec cegep students, starting in Quebec City, that tracks a student's real
cote R session over session, shows what each target university program needs, surfaces
bursaries anchored on their own cegep's foundation, and generates a counselor-prep export.

See `docs/00-BUILD-PROMPT.md` for the full build plan and phase-by-phase acceptance checks, and
`docs/SETUP-CLOUD.md` for what's needed to move from local-only scaffolding to a real deploy.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth/Postgres/RLS), Stripe
(premium tier), deployed on Vercel, installable as a PWA.

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
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run collect:sainte-foy` | Push `supabase/seed/sainte-foy/*.json` through the staging pipeline |
| `npm run promote:review` | Diff pending staging rows against production, auto-flag large changes |
| `npm run promote` | Promote human-approved staging rows into production |

## Repo layout

- `src/app` — routes; `src/lib/db` — Supabase clients + hand-authored types; `src/lib/rscore`,
  `src/lib/matching` — core domain logic (Phase 2, Phase 4)
- `scripts/collectors` — HTML/PDF/manual collectors and the staging→production promotion
  pipeline, see `docs/02-scraping-collection-plan.md`
- `supabase/migrations` — schema, one migration per table cluster; `supabase/seed` — hand-
  researched pilot data templates
- `docs` — the product's spec docs, kept in the repo for reference
