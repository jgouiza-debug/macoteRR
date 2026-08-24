# Cloud setup handoff

Everything up to this point (app scaffold, migrations, collector/promotion scripts, seed
templates) was built and verified without any Supabase or Vercel account, and without Docker.
That's as far as local-only verification can go — the real acceptance checks in
`docs/00-BUILD-PROMPT.md` (live auth, real source-linked query results, a live deploy URL)
need one of the two paths below. Pick whichever fits; both are documented, neither is chosen for
you.

## Path A — Install Docker Desktop (fully local, no cloud account yet)

1. Install Docker Desktop and make sure it's running (`docker info` should succeed).
2. `npx supabase start` — spins up a full local Postgres/Auth/Storage stack. First run pulls
   several images; that's expected.
3. `npx supabase db push` (or `npx supabase migration up`) — applies every migration in
   `supabase/migrations/` in order.
4. `npx supabase gen types typescript --local > src/lib/db/database.types.ts` — regenerates the
   hand-authored types from the real schema; diff against what's there now as a correctness
   check (it should match exactly).
5. Copy `.env.local.example` to `.env.local` and fill in the local stack's URL/anon key
   (`npx supabase status` prints them).
6. `npm run collect:sainte-foy` once `supabase/seed/sainte-foy/*.json` has real, sourced data in
   it, then `npm run promote:review` and `npm run promote` to exercise the full pipeline.
7. `npm run dev`, sign up a test account, confirm the magic-link flow works end-to-end.

This unblocks everything except a real deploy URL — Vercel still needs a cloud Supabase project
to talk to (a local Docker stack isn't reachable from Vercel's servers), so Path B is still the
one needed before Phase 0's literal "blank deploy live at a real URL" check can pass for real.

## Path B — Create a free Supabase project (needed eventually regardless of Path A)

1. Create a project at supabase.com (free tier is enough for this stage).
2. `npx supabase link --project-ref <ref>` — the ref is in the project's dashboard URL.
3. `npx supabase db push` — applies every migration in `supabase/migrations/` to the real
   project.
4. `npx supabase gen types typescript --project-id <ref> > src/lib/db/database.types.ts` —
   regenerate and diff against the hand-authored version, same as Path A step 4.
5. Copy `.env.local.example` to `.env.local`, fill in the project's URL/anon key (Project
   Settings → API) and the service-role key (same page — keep this one out of anything
   client-side, per the warning already in `.env.local.example`).
6. `npm run collect:sainte-foy` / `npm run promote:review` / `npm run promote` once the seed
   templates have real data.
7. `npm run dev`, sign up a test account, confirm the magic-link flow works end-to-end.
8. Deploy: `vercel link`, set the same three env vars in the Vercel project settings, deploy.
   Verify auth works against the live URL, not just localhost.

## Either way

- Auth email templates and the magic-link redirect URL (Authentication → URL Configuration in
  the Supabase dashboard) need to point at wherever `src/app/auth/callback/route.ts` is actually
  reachable (`http://localhost:3000/auth/callback` locally, the real Vercel URL in production).
- Row Level Security is already enabled on every table (see the migrations) — the student-data
  cluster restricts to `auth.uid()`, the catalog clusters are public-read-only. Nothing extra to
  configure there.
