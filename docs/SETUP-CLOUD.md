# Cloud setup handoff

Everything in this repo was built and verified without a Supabase or Vercel account and
without Docker. The schema, the seed, row-level security and the profile sync are exercised
against a local Postgres (see "Local verification bed"); what still needs a real project is
the live acceptance checks in `docs/00-BUILD-PROMPT.md` (magic-link auth end to end, a deploy
URL). Pick whichever path fits; both are documented, neither is chosen for you.

## Local verification bed (no cloud account, no Docker required)

`scripts/db/local/up.sh` stands up a Postgres 16 (Docker if a daemon is reachable, otherwise
the local binaries as an unprivileged user), installs a shim `auth` schema that mimics
Supabase's `auth.uid()` / roles / grants, applies every migration in order, and loads the
catalogue seed. It prints the `DATABASE_URL` the scripts below read (also picked up from
`.env.local`).

```bash
npm run db:local                 # create or reset the bed and load everything
npm run test:rls                 # real RLS test: two users + anon, cross-user reads/writes, catalogue read-only
npm run build:schema             # regenerate supabase/full_schema.sql from the migrations
npm run check:schema             # exit 1 if full_schema.sql drifted from the migrations
scripts/db/local/dump-diff.sh    # prove full_schema.sql builds the same database as the migrations
npm run gen:types                # regenerate the Database type from the live schema (no Docker needed)
npm run build:catalog            # regenerate supabase/seed/catalog.sql + src/lib/data/version.ts from the TS data
npm run check:data               # cross-reference and guardrail checks on the shipped data
```

`supabase gen types --db-url` needs a pg-meta container even for a plain Postgres, which is
why `gen:types` introspects `information_schema` through `psql` instead. Its output replaces
only the `Database` type; the named unions above it are kept.

## Local development without a Supabase project

Copy `.env.local.example` and use the "without a Supabase project" block: the Supabase URL
points at a port nothing listens on, so `createClient()` succeeds and every auth/DB call
fails fast. The app then runs as a guest: the whole funnel works, the outbox keeps its
mutations pending, nothing is lost. `MACOTE_DEV_AUTH_BYPASS=1` lets `src/proxy.ts` serve the
protected pages to that guest so `npm run shots` can render them against a seeded
localStorage profile. The bypass is gated on `NODE_ENV !== "production"` at compile time and
does not exist in a production bundle.

```bash
npm run dev
npm run shots -- --serve         # every screen, every seeded state, both locales, phone + desktop
```

## Path A — Install Docker Desktop (fully local Supabase stack)

1. Install Docker Desktop and make sure it's running (`docker info` should succeed).
2. `npx supabase start` — spins up a full local Postgres/Auth/Storage stack.
3. `npx supabase db push` — applies every migration in `supabase/migrations/` in order.
4. `npx supabase db query --local -f supabase/seed/catalog.sql` — loads the catalogue
   (`supabase/config.toml` also lists it under `db.seed`, so `supabase db reset` loads it).
5. Copy `.env.local.example` to `.env.local` and fill in the local stack's URL/anon key
   (`npx supabase status` prints them).
6. `npm run dev`, sign up a test account, confirm the magic-link and OTP flows end-to-end.

Vercel still needs a cloud Supabase project to talk to, so Path B is needed before the
"blank deploy live at a real URL" check can pass.

## Path B — Create a free Supabase project (needed eventually regardless of Path A)

1. Create a project at supabase.com (free tier is enough). Note the region: it decides
   whether personal information leaves Quebec (see `LEGAL-REVIEW-NOTES.md`).
2. `npx supabase link --project-ref <ref>` — the ref is in the project's dashboard URL.
3. `npx supabase db push` — applies every migration through `20260902120000`.
4. Load the catalogue: SQL editor → paste `supabase/seed/catalog.sql` → Run, or
   `npx supabase db query --linked -f supabase/seed/catalog.sql`. It is idempotent (upserts
   on `short_code` / `catalog_slug` / `course_code` / `program_code`) and inserts a
   `catalog_versions` row that `/api/reference/version` reports.
5. Copy `.env.local.example` to `.env.local`, fill in the project's URL/anon key (Project
   Settings → API) and the service-role key (same page — keep this one out of anything
   client-side, per the warning in the example file).
6. `npm run dev`, sign up a test account, confirm the magic-link and OTP flows end-to-end.
7. Deploy: `vercel link`, set the same env vars in the Vercel project settings, deploy.
   Verify auth works against the live URL, not just localhost.

Verify the seed landed:

```bash
npx supabase db query --linked "select version, generated_at, row_counts from catalog_versions order by generated_at desc limit 1;"
```

## What the seed contains, and where it comes from

`npm run build:catalog` reads the verified TypeScript data the app ships (`src/lib/sample-data.ts`
programmes, cutoffs and bursaries; `src/lib/data/important-dates.ts`;
`src/lib/data/generic-program-profiles.ts`; the NY courses in `src/lib/data/cegep-catalog.ts`;
the scraped cégep offerings in `src/lib/data/raw/cegep-programs.json`) and writes:

- `supabase/seed/catalog.sql` — every catalogue table: 11 cégeps, 150 cégep programmes, 16
  universities, 237 university programmes, 491 cutoff figures, 9 courses, the prerequisite
  links the parser resolves, 15 in-region bursaries, 16 dates, 2 generic profiles.
- `src/lib/data/version.ts` — the catalogue version (a hash of the seed body), so the bundle
  in the app and the rows in Postgres report the same version for the same data.

Regenerate both after editing any of those files; commit the generated output. There is no
`catalog.generated.ts` any more — the client reads the same TypeScript modules directly.

## How data reaches students without a redeploy

`/api/reference/version` and `/api/reference/bundle` read `catalog_versions` and the
catalogue tables when `NEXT_PUBLIC_SUPABASE_*` is set, overlay them onto the shipped data
(a database row wins only when its `last_verified_at` is not older than the shipped one),
and fall back to the shipped data otherwise. Clients (`src/lib/data/reference-store.ts`) ask
for the version on boot, keep the last bundle in IndexedDB, and re-fetch only when it
changed. So: promote a corrected row through `scripts/collectors/promote`, insert a new
`catalog_versions` row, and every client picks it up on its next boot.

## Either way

- Auth email templates and the magic-link redirect URL (Authentication → URL Configuration in
  the Supabase dashboard) need to point at wherever `src/app/auth/callback/route.ts` is actually
  reachable (`http://localhost:3000/auth/callback` locally, the real Vercel URL in production).
  `docs/email-templates/README.md` has the templates.
- Row Level Security is enabled on every table (see the migrations, and `npm run test:rls`
  for the proof) — the student-data cluster restricts to `auth.uid()`, the catalogue clusters
  are public-read-only, staging is service-role only.

## Web Push (partial)

What is built and live:

- The service worker (`src/app/sw.ts`) has `push` and `notificationclick` handlers, so once a
  device is subscribed and something sends a message, the reminder shows and tapping it focuses
  or opens the app. The tap URL is resolved against this origin, so a payload can never open an
  off-site tab.
- An offline fallback page (`/~offline`) is precached and served when a navigation misses both
  the network and the cache.
- Runtime caches are versioned by `NEXT_PUBLIC_BUILD_ID` (the deploy's commit sha), so a deploy
  never serves a previous build's assets.

What still needs building before push actually reaches a phone (the plan is in the session
handoff, group `push`):

1. `src/lib/notifications/push.ts` — `subscribeToPush` / `unsubscribeFromPush` storing to
   `push_subscriptions` (RLS own rows), gated on `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
2. A push section on `/profile/notifications`, shown only when the key is set and the browser
   supports it (on iOS, only when installed to the Home Screen).
3. `scripts/notifications/send-due.ts` — a cron that reads due `notification_events`, joins
   `push_subscriptions`, and sends with the `web-push` package. It needs the service-role key
   and the private VAPID key, which live only in the cron's environment: `SUPABASE_SERVICE_ROLE_KEY`
   and `VAPID_PRIVATE_KEY` must never appear under `src/`.

Until keys are set the push section does not render, so nothing here changes the app for a
student today — the in-app notification inbox (the bell in the top bar) already surfaces the
same reminders.
