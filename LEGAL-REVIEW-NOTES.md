# Legal review notes — MaCote

**Status: DRAFT. Not legal advice. Neither the author of these documents nor the person who
commissioned them is a lawyer.**

This file exists because `/confidentialite`, `/conditions` and `/accessibilite` were drafted
from a plain-language reading of Quebec's Loi 25 obligations. They must be reviewed by a
qualified person — ideally a lawyer familiar with Quebec privacy law — **before the site goes
live**. Nothing below should be read as a claim that MaCote is compliant.

Last updated: 2026-09-03.

---

## 1. Obligation-by-obligation status

The single most important column is the middle one. "Described" means the policy text says it
happens; it does **not** mean code exists that makes it happen. Do not let a reviewer assume
otherwise.

| Loi 25 obligation | Status in the product today | Where it's addressed |
|---|---|---|
| Consent must be manifeste, libre, éclairé, requested separately per purpose, in plain terms | **Partially implemented.** The product genuinely collects little, and each data category has one narrow purpose. But there is no per-purpose consent *interface* — no separate opt-in per processing purpose. | Described in `/confidentialite` §"Ce que MaCote recueille, et pourquoi" |
| Express consent for sensitive information | **Not applicable as designed / not implemented.** The product deliberately collects no sensitive information (no financial, health, biometric data). If that ever changes, this needs building. | Described in `/confidentialite` summary |
| Minors under 14 — parental consent unless manifestly for the minor's benefit | **Described only.** There is no age gate, no age field, and no parental-consent flow. The policy states what happens if an under-14 user is identified (deletion on request), but nothing detects one. | `/confidentialite` §"Si tu as moins de 14 ans" |
| Named person responsible for protection of personal information, with title and contact published | **Not set — env-driven.** The policy renders `NEXT_PUBLIC_PRIVACY_OFFICER` and `NEXT_PUBLIC_CONTACT_EMAIL` (see §4); while either is unset the page shows a visible "à confirmer" chip in its place. **A real name and title must be set before launch; this is an explicit statutory requirement, not a nicety.** | `/confidentialite` §"Responsable de la protection…" |
| Privacy settings default to highest confidentiality with no user action | **Implemented.** `DEFAULT_PROFILE` in `src/lib/profile/store.ts` ships with no tags selected, no targets, and null score. Nothing is shared with other users or public by design — there is no social/sharing surface in the product at all. | `/confidentialite` §"Paramètres de confidentialité par défaut" |
| Data portability in a structured, commonly used technological format (since 2024-09-22) | **Described only.** No export endpoint or button exists yet. Policy directs users to email a request. | `/confidentialite` §"Tes droits" |
| Right to deletion / de-indexing | **Partially implemented.** Data deletion is done client-side in `src/app/(app)/profile/page.tsx`: the signed-in student deletes their own rows in `student_profiles`, `student_r_score_confirmations`, `student_targets`, `student_course_grades`, `notification_preferences` and `notification_events` (each under RLS, scoped to `user_id`), then is signed out and the local profile is reset. **Not built:** deleting the `auth.users` row itself, which needs a service-role endpoint (`auth.admin.deleteUser`) that does not exist yet — the account identity (email) therefore survives a "delete" until that endpoint ships. The policy text still says deletion goes through email; see §6. | `/confidentialite` §"Tes droits" |
| Breach notification to the Commission d'accès à l'information and affected individuals; breach register | **Described only.** No incident-response process, no register, no notification tooling exists. The policy states the commitment; there is currently no operational procedure behind it. | `/confidentialite` §"En cas d'incident de confidentialité" |
| Privacy impact assessment before acquiring a system handling personal information or transferring data outside Quebec | **Not done.** No PIA has been conducted. This is flagged as required, not completed. | `/confidentialite` §"Qui a accès à tes données" |
| Data residency disclosure | **Unresolved — blocking.** See §2 below. | `/confidentialite` — renders `NEXT_PUBLIC_DATA_REGION`, an "à confirmer" chip until set (§4) |

---

## 2. Open questions a lawyer (or the site owner) must answer

These are not rhetorical. Each one blocks a specific line of published text.

1. **Where will the data physically live?** The policy currently renders an "à confirmer" chip
   where `NEXT_PUBLIC_DATA_REGION` will go. The stack is Supabase (Postgres). Supabase region choice determines whether
   personal information leaves Quebec, which in turn determines whether a privacy impact
   assessment is mandatory before launch. **No Supabase project existed at time of writing**, so
   this genuinely cannot be answered yet — but it must be answered before the privacy page is
   published with a real claim in it.
2. **Who is the named responsible person?** Statutorily required to be published. Needs a real
   name and title. If the project is one student, that's fine — but the name has to appear.
3. **What contact address should legal/privacy requests go to?** Every legal page and the
   contact/institutional pages now read `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_PILOT_EMAIL`
   and show an "à confirmer" chip until they are set; the two forms keep their submit button
   disabled meanwhile. No placeholder address ships in the page text any more, but a real,
   monitored mailbox still has to exist before launch.
4. **Is an under-14 user realistically in scope, and does an age gate need to exist?** The
   stated audience is 16–19. Some cégep students, and some curious secondary-school students,
   will be younger. Does the "manifestly for the minor's benefit" exemption cover a free
   academic-planning tool? A lawyer should answer this rather than the developer assuming it.
5. **Does the accuracy disclaimer in `/conditions` adequately limit liability** for a student who
   makes an admission decision based on a compiled cutoff range that turns out to be stale? The
   disclaimer is written in plain language deliberately (the audience is 17), which may trade
   legal robustness for readability. A lawyer should confirm that trade is acceptable or fix it.
6. **Anonymous (pre-account) local data** — data held only in the browser's `localStorage`, never
   transmitted. Does this constitute "collection" of personal information under Loi 25 at all?
   The policy currently describes it transparently either way, which seems the safe posture, but
   the classification affects what obligations attach.
7. **Is a formal privacy policy acceptance / consent moment needed at account creation**, or is
   the current "policy is linked in the footer" posture sufficient? No consent checkbox exists in
   the account-creation flow today.

---

## 3. Assumptions made while drafting

Stated explicitly so a reviewer can challenge them rather than inherit them silently.

- **Assumed** Loi 25 applies to this project directly (private-sector enterprise operating in
  Quebec, collecting personal information from Quebec residents), regardless of the project's
  small scale, non-commercial nature, or the fact that it has no users yet.
- **Assumed** grades and R-score constitute personal information but not *sensitive* personal
  information under the Act. If academic records are treated as sensitive, the express-consent
  obligation attaches and the current design does not satisfy it.
- **Assumed** the plain-language style (short sentences, `tu` form in French, a summary box at
  the top) is legally acceptable and not merely marketing. The Act's own "plain terms"
  requirement appears to favour this, but a formal review should confirm the documents still say
  what they need to say.
- **Assumed** it is better to publish "described but not implemented" honestly in this file than
  to write a policy that reads as if everything is already built. **Do not "clean up" this
  distinction before review** — the gap between the two columns in §1 is the single most useful
  thing on this page for a reviewer.
- **Did not** copy boilerplate from another company's privacy policy, deliberately. Nothing here
  was lifted from a template that might describe practices this product doesn't have.

---

## 4. Page values that must be set before launch (env-driven, visible until set)

The former bracket placeholders (`[Nom du/de la responsable]`, `[courriel de contact]`,
`[à confirmer]`, `[Ton nom]`, `[ton cégep]`) and the made-up `bonjour@macote.xyz` /
`pilotes@macote.xyz` addresses are gone from the content files. Each value is now read from one
`NEXT_PUBLIC_*` variable in `src/lib/site-config.ts` (`SITE_CONFIG`) and rendered through
`src/components/marketing/PendingValue.tsx`. **Nothing is invented as a default: while a
variable is unset, empty or whitespace, the page shows a small dashed "à confirmer" /
"to be confirmed" chip exactly where the value will appear — announced to screen readers as
"valeur à confirmer avant le lancement" / "value to be confirmed before launch" (visually hidden
text, since a plain `<span>` cannot carry an `aria-label`), and marked with a
`data-pending-value` attribute.** That is deliberate — a reviewer or the site owner can see at a glance what
is still missing on the live page instead of trusting this file. Set them in `.env.local`
(template in `.env.local.example`) or the host's environment; they are `NEXT_PUBLIC_` because
they are published page text, not secrets.

| Variable | Fills | Where it renders | While unset |
|---|---|---|---|
| `NEXT_PUBLIC_CONTACT_EMAIL` | The address for general, privacy, under-14 and accessibility requests | `/contact` (direct link + the form's mailto:), `/confidentialite` (under-14, rights, responsible-person sections), `/accessibilite` ("Signaler un problème") | Chip in every sentence; on `/contact` the direct link is replaced by the chip, the form's submit is disabled and the page says "Adresse de contact à confirmer avant le lancement." |
| `NEXT_PUBLIC_PILOT_EMAIL` | The address the cégep pilot form mails to | `/pour-les-cegeps` contact form (mailto: only, never displayed) | Submit disabled with the same one-line note; no mailto: is built |
| `NEXT_PUBLIC_PRIVACY_OFFICER` | Name and title of the person responsible for the protection of personal information (Loi 25, statutory) | `/confidentialite` §"Responsable de la protection…" | Chip at the start of the sentence |
| `NEXT_PUBLIC_DATA_REGION` | Where the data is physically hosted (Supabase region / provider) — see §2 q.1 | `/confidentialite` summary point "Hébergement : …" and §"Qui a accès à tes données" ("Hébergement technique : …") | Chip; the sentence about the Canadian-hosting goal stays |
| `NEXT_PUBLIC_FOUNDER_NAME` | The founder's name | `/a-propos` identity card (the `{founderName}` token in `src/content/a-propos.ts` `identity.name`) | Chip |
| `NEXT_PUBLIC_FOUNDER_CEGEP` | The founder's cégep | `/a-propos` identity card (the `{founderCegep}` token in `src/content/a-propos.ts` `identity.cegep`) | Chip |

`NEXT_PUBLIC_SITE_URL` (same file) overrides the canonical `https://www.macote.xyz` origin for
local/preview builds; it is not page text and has a real default.

Before launch: the bracket/address grep
`grep -rn "\[Nom\|\[courriel\|\[à confirmer\|\[Ton nom\|\[ton cégep\|\[Your name\|\[your cégep\|\[contact email\|\[Responsible\|@macote.xyz" src`
must return nothing (it does as of this update), and a production build with all six
variables set must render no chip on any page. `scripts/screenshots/walk.ts` flags leftover
bracket placeholders but not the chips — check the chips by eye, or add a check that no
`[data-pending-value]` element is rendered on any page. The one-line form notes in `src/content/contact.ts` and `pour-les-cegeps.ts`
("Adresse de contact à confirmer avant le lancement.") only render while the matching
address variable is unset.

---

## 5. Related product constraint worth flagging to a reviewer

The `/conditions` accuracy disclaimer is not generic legal padding — it reflects a real,
documented data limitation this project verified independently:

- Universities do **not** publish a single current-year admission cutoff. They publish
  multi-year ranges, or minimum/maximum/average figures, and the most recent official figures
  can run **two to six years behind** the current admission cycle.
- The product's data model enforces this: `src/lib/rscore/cutoff-range.ts` returns
  above / inside / below / **unknown** against a published *range*, never a numeric delta
  against a single number, and `cutoff_history` rows each carry their own `figure_type` and
  `source_tier`.
- Cutoff figures that could not be re-confirmed against a primary source were **removed** from
  the dataset rather than shipped.

See `docs/01-data-architecture.md` for the underlying research. A reviewer assessing
misrepresentation risk should know the product is deliberately conservative here.

---

## 6. Policy text known to lag the product

- `/confidentialite` §"Tes droits" still says access/portability **and deletion** requests go
  through email and that "un outil en libre-service est prévu mais n'est pas encore construit".
  Deletion of the student's data now has a self-serve button (see the §1 row); the sentence was
  left as is on purpose until the `auth.users` deletion endpoint exists and a reviewer decides
  how to describe a deletion that removes the data but not yet the account. Export/portability
  is still email-only, so that half of the sentence remains accurate.
