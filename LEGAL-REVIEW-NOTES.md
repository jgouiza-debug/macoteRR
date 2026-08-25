# Legal review notes — MaCote

**Status: DRAFT. Not legal advice. Neither the author of these documents nor the person who
commissioned them is a lawyer.**

This file exists because `/confidentialite`, `/conditions` and `/accessibilite` were drafted
from a plain-language reading of Quebec's Loi 25 obligations. They must be reviewed by a
qualified person — ideally a lawyer familiar with Quebec privacy law — **before the site goes
live**. Nothing below should be read as a claim that MaCote is compliant.

Last updated: 2026-08-24.

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
| Named person responsible for protection of personal information, with title and contact published | **Not implemented — placeholder.** The policy contains `[Nom du/de la responsable]`. **A real name and title must be filled in before launch; this is an explicit statutory requirement, not a nicety.** | `/confidentialite` §"Responsable de la protection…" |
| Privacy settings default to highest confidentiality with no user action | **Implemented.** `DEFAULT_PROFILE` in `src/lib/profile/store.ts` ships with no tags selected, no targets, and null score. Nothing is shared with other users or public by design — there is no social/sharing surface in the product at all. | `/confidentialite` §"Paramètres de confidentialité par défaut" |
| Data portability in a structured, commonly used technological format (since 2024-09-22) | **Described only.** No export endpoint or button exists yet. Policy directs users to email a request. | `/confidentialite` §"Tes droits" |
| Right to deletion / de-indexing | **Described only, code planned.** A deletion endpoint (service-role, cascading across `student_profiles`, `student_course_grades`, `student_r_score_confirmations`, `student_targets`, then `auth.admin.deleteUser`) is in the implementation plan but **not built at time of writing**. Verify current state before relying on this row. | `/confidentialite` §"Tes droits" |
| Breach notification to the Commission d'accès à l'information and affected individuals; breach register | **Described only.** No incident-response process, no register, no notification tooling exists. The policy states the commitment; there is currently no operational procedure behind it. | `/confidentialite` §"En cas d'incident de confidentialité" |
| Privacy impact assessment before acquiring a system handling personal information or transferring data outside Quebec | **Not done.** No PIA has been conducted. This is flagged as required, not completed. | `/confidentialite` §"Qui a accès à tes données" |
| Data residency disclosure | **Unresolved — blocking.** See §2 below. | `/confidentialite` — currently a `[placeholder]` |

---

## 2. Open questions a lawyer (or the site owner) must answer

These are not rhetorical. Each one blocks a specific line of published text.

1. **Where will the data physically live?** The policy currently says
   `[à confirmer]`. The stack is Supabase (Postgres). Supabase region choice determines whether
   personal information leaves Quebec, which in turn determines whether a privacy impact
   assessment is mandatory before launch. **No Supabase project existed at time of writing**, so
   this genuinely cannot be answered yet — but it must be answered before the privacy page is
   published with a real claim in it.
2. **Who is the named responsible person?** Statutorily required to be published. Needs a real
   name and title. If the project is one student, that's fine — but the name has to appear.
3. **What contact address should legal/privacy requests go to?** Every legal page currently
   points at `[courriel de contact]`, and the contact/institutional pages use placeholder
   addresses (`bonjour@macote.xyz`, `pilotes@macote.xyz`) which are **not registered** — the
   domain itself isn't registered yet.
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

## 4. Known content placeholders that must be replaced before launch

Every one of these is currently visible in published page text:

- `[Nom du/de la responsable]` / `[Responsible person's name]` — `/confidentialite`
- `[courriel de contact]` / `[contact email]` — `/confidentialite`, `/accessibilite`
- `[à confirmer]` hosting/region statement — `/confidentialite` (both languages)
- `bonjour@macote.xyz` — `/contact` (placeholder; domain not registered)
- `pilotes@macote.xyz` — `/pour-les-cegeps` (placeholder; domain not registered)
- `[Ton nom]` / `[Your name]`, `[ton cégep]` / `[your cégep]` — `/a-propos` (deliberately left
  as placeholders rather than inventing a founder's identity)

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
