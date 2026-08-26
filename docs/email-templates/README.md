# Auth email templates

Supabase renders these; nothing in this repo sends them. They live here so the copy and the
brand are reviewable in version control instead of only existing in a dashboard textarea.

## Installing

Supabase dashboard → **Authentication → Email Templates**.

Paste [`magic-link.html`](./magic-link.html) into **BOTH** of these, with the subject
`Ta connexion à MaCote / Your MaCote sign-in link`:

- **Confirm signup**
- **Magic Link**

Both, because `signInWithOtp` picks the template by whether the address already has an account:
a new user gets **Confirm signup**, a returning one gets **Magic Link**. Filling in only Magic
Link looks correct right up until you test it — every early sign-up is a new user, so every
email comes from the template you did not touch, and Supabase's unbranded default ships instead.

The same body works in both: `{{ .ConfirmationURL }}` is valid in each, and the copy reads
correctly whether the account is being created or resumed.

Strip the leading `<!-- ... -->` comment before pasting. It never renders, but it names internal
file paths, and those should not travel to recipients.

## Also required, or the link will not work

**Authentication → URL Configuration:**

- **Site URL:** `https://www.macote.xyz`
- **Redirect URLs** (allow-list — Supabase rejects any `emailRedirectTo` not listed):
  - `https://www.macote.xyz/auth/callback`
  - `http://localhost:3000/auth/callback` — local development only

`src/lib/auth/redirect.ts` decides which of those the app asks for. It never sends the native
shell's own origin, which is `localhost` inside Capacitor and unreachable from a mail client.

## The 6-digit code is not decoration

`{{ .Token }}` in the template is the primary sign-in path for the native app, not a fallback.

Supabase's PKCE flow ties the emailed link to the client that *started* the sign-in, by way of
a code verifier held in that client's storage. Tapping the link opens the system browser, which
has no such verifier, so the exchange fails there — and the app, a separate WebView with its own
storage, never learns anything happened. The student ends up signed in nowhere.

A typed code has no hand-off: `verifyOtp` runs in the very client that asked for the code, so
the session lands where the student actually is. Do not remove the code block from the template
without first shipping Universal Links / App Links, which is the only other way to keep the
link inside the app.

## Variables

Supabase exposes `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`,
`{{ .Email }}`. The template uses `ConfirmationURL`, which honours the `emailRedirectTo` the app
sends, in two places: the button and a copy-paste fallback for clients that strip buttons.

## Branding

The template mirrors the app's tokens from `src/app/globals.css` exactly — every colour in it
is one of `chalk`, `paper`, `ink`, `secondary`, `hairline`, `ultramarine`, with no
approximations. Geometry follows the app's own rule verbatim: *structure is square (3px),
actions are pill (full), nothing between*, so the card is 3px and the button is fully rounded.

The header reproduces `src/components/ui/Logo.tsx`: the mark from `/brand/mark.png` at 31×24
(the mark's true 1.300 ratio, the same `size * 1.3` the component uses) beside the wordmark set
in ultramarine.

Type is Bricolage Grotesque over Instrument Sans, the app's own pairing, pulled from Google
Fonts. Apple Mail, iOS Mail and Samsung Mail honour that; Gmail and Outlook ignore it, which is
why every `font-family` still ends in a system sans that degrades predictably.

## Client constraints

The full reasoning is in the comment block at the top of the HTML. In short: table layout and
inline styles (Gmail strips `<style>`, Outlook ignores modern CSS); the mark carries alt text
and the wordmark beside it is live text, so the header still reads as MaCote with images
blocked; no large imagery, because Gmail clips around 102KB and appends "View entire message",
which would bury the one action the email exists for; and bilingual in a single send, because
Supabase templates have no locale variable and the address is collected before any language
preference exists.

## Rate limits

The built-in SMTP is capped at a handful of emails per hour and is not meant for production.
Once real students use this, configure custom SMTP under **Authentication → SMTP Settings**;
until then a burst of sign-ups will hit the cap and the app will surface the provider's own
"rate limit exceeded" message (see `src/app/onboarding/account/page.tsx`).
