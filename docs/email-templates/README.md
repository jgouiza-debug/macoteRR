# Auth email templates

Supabase renders these; nothing in this repo sends them. They live here so the copy and the
brand are reviewable in version control instead of only existing in a dashboard textarea.

## Installing

Supabase dashboard → **Authentication → Email Templates → Magic Link**.

- **Subject:** `Ta connexion à MaCote / Your MaCote sign-in link`
- **Body:** paste the whole of [`magic-link.html`](./magic-link.html)

The app only ever calls `signInWithOtp`, so Magic Link is the only template it uses. "Confirm
signup" is not in the flow — with OTP, the first link both creates the user and signs them in.

## Also required, or the link will not work

**Authentication → URL Configuration:**

- **Site URL:** `https://www.macote.xyz`
- **Redirect URLs** (allow-list — Supabase rejects any `emailRedirectTo` not listed):
  - `https://www.macote.xyz/auth/callback`
  - `http://localhost:3000/auth/callback` — local development only

`src/lib/auth/redirect.ts` decides which of those the app asks for. It never sends the native
shell's own origin, which is `localhost` inside Capacitor and unreachable from a mail client.

## Variables

Supabase exposes `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`,
`{{ .Email }}`. The template uses `ConfirmationURL`, which honours the `emailRedirectTo` the app
sends, in two places: the button and a copy-paste fallback for clients that strip buttons.

## Why the template looks the way it does

Every constraint is written up in the comment block at the top of the HTML. In short: table
layout and inline styles (Gmail strips `<style>`, Outlook ignores modern CSS), no web fonts,
no images (blocked by default, and keeps the mail under Gmail's ~102KB clipping threshold),
and bilingual in one send because Supabase templates have no locale variable and the address is
collected before any language preference exists.

## Rate limits

The built-in SMTP is capped at a handful of emails per hour and is not meant for production.
Once real students use this, configure custom SMTP under **Authentication → SMTP Settings**;
until then a burst of sign-ups will hit the cap and the app will surface the provider's own
"rate limit exceeded" message (see `src/app/onboarding/account/page.tsx`).
