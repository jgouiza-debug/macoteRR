# UX laws audit: Hick's, Fitts's, Jakob's

Every screen of the marketing site, the onboarding funnel and the signed-in app was read against
three laws and fixed in the same pass. This file is the record: what each law asks for, what was
found, what changed, and what was deliberately left for a later round.

## The three laws, as applied here

| Law | What it says | How it was tested |
|---|---|---|
| **Hick's** | Decision time grows with the number and complexity of choices. | Count the equal-weight actions on a screen; look for one clear primary, progressive disclosure for the rest, and grouping for long lists. |
| **Fitts's** | Time to hit a target depends on its size and its distance from the pointer. | Every interactive element measured against the product's 44px floor / 48px target; adjacent targets need real clearance; the forward action belongs in the thumb zone on a phone. |
| **Jakob's** | People expect a product to work like the ones they already use. | Conventional nav and menus, links that look like links, forms that submit on Enter, switches that toggle from the whole row, modals with a focus trap and Escape. |

Guardrail #5 (no rankings or recommendations) constrains Hick's fixes: nothing here highlights a
"recommended" programme. Choice load is reduced by grouping, sorting on stated criteria (how many
bursaries ask for a tag), and disclosure, never by picking for the student.

## Cross-cutting fixes

- **`--shadow-overlay` was never defined.** `Sheet`, `SyncErrorToast` and the profile row all
  referenced it, so every overlay rendered flat. Defined in `globals.css` next to `--shadow-card`.
- **Bottom sheets carry a grabber** on phones, the affordance every native sheet has.
- **`SourceStamp` links are underlined.** A bordered chip alone read as a metadata tag; these leave
  the app, so they now look like links.
- **Links underline at rest** wherever the old rule was `hover:underline`: hover never fires on a
  phone, so those links looked like body text.
- **IosInstallGuide removed.** It was a hand-rolled modal (no focus trap, no Escape, no backdrop
  dismiss) that auto-opened 1.2s after the home page painted, on top of an install card that
  already listed the same three steps. Its `pwa.*` strings went with it.

## Marketing site

### Found

| Law | Finding | Severity |
|---|---|---|
| Jakob | No mobile menu at all: below `md` the nav was `hidden`, and the only site navigation was the footer after the article. | High |
| Jakob / Fitts | Language switch hidden below `sm`, so a phone had no way to change language. | High |
| Jakob | Header "Ouvrir l'app" linked to the marketing home; on `/` it was a self-link. Same for the install bar's CTA. | High |
| Fitts | Footer links 20px tall at 10px spacing; table-of-contents anchors 20px tall at 8px; app footer legal links ~15px. | High |
| Hick's | Two ultramarine "open the app" pills 40px apart on the home hero; FAQ rendered as four fully expanded equal-weight blocks. | Medium |
| Fitts | Install card's "continue in browser" escape hatch ~22px tall; inline email links mid-paragraph with no vertical padding. | Medium |
| Jakob | Contact form said "Envoyer" but handed off to `mailto:`; 404 page had no site chrome; legal draft banner looked like a neutral note. | Medium |
| Hick's | `CopyLinkControl` had an inline "Copier" and a primary button doing the same thing. | Medium |

### Changed

- `SiteHeader`: 48px logo, nav and language targets; `aria-current` on the active page; the app
  CTA points at `/app` (with `?lang=en` from the English site) and is omitted on the home page,
  where the install card is the hero; a `MobileMenu` button below `md`.
- `MobileMenu` (new): a `Sheet` with two short labelled groups (Comprendre / MaCote) plus the
  language switch. `Sheet` gained a `closeLabel` prop so URL-locale pages can label the close.
- `SiteFooter`: 44px rows with no gap, product / site / legal columns titled distinctly, language
  switch in the bottom row on every size, logo link padded.
- `SkipLink`, `TableOfContents`, `FaqList` (new): one copy each instead of seven inline blocks;
  TOC links coloured and underlined at 44px rows; FAQ as native `<details>` rows with a rotating
  chevron (answers stay in the DOM, so the FAQPage JSON-LD still matches).
- `InstallBar`: CTA goes to the app; an in-flow spacer pads the footer instead of covering it.
- `HomePage`: on phones the order is headline, install card, then the three facts, so the one
  action is within the first screen; two columns from `md` up.
- `InstallCard`: both secondary links are 48px and underlined; `focus-visible:outline-none`
  removed from five controls (inert today, a latent removal of the focus ring).
- `CopyLinkControl`: inline copy button removed, URL stays selectable, one primary.
- `ContactPage`: submit reads "Envoyer par courriel" with a note that it opens the mail client;
  inputs use a focus border instead of `outline-none`. `CegepContactForm`: resizable textarea.
- `PourLesCegepsPage`: a 48px jump link to the pilot form under the intro.
- `LegalPage`: draft banner in the ember "provisional" treatment. `PendingValue` email links
  underlined with padded hit boxes. `not-found` keeps the header and footer and offers both homes.
- `app-shell/Footer`: 44px rows, underlined, 13px.

## Onboarding

### Found

| Law | Finding | Severity |
|---|---|---|
| Jakob | No step indicator anywhere in a five-step funnel. | High |
| Fitts | Primary CTA placement varied by step: sticky footer on some, in-flow after eight suggestion cards on the goal step, mounting only after a selection on the programme step. | High |
| Fitts | Session chips 44px with 6px gaps; the skeleton was a different shape and height. | High |
| Hick's | Score step: three rows in three different treatments plus a fourth exit pill, all reading as recommendations. | High |
| Jakob | Account screens were not forms: `onKeyDown` Enter handlers, `type="button"` submits, no `enterKeyHint`, OTP field not focused on arrival. | High |
| Fitts | `SourceStamp`'s 44px hit box reached into the programme row above it (`gap-1`); university chips 6px apart in a wrap; estimate rows had a delete 8px from a text field. | Medium |
| Jakob | Destructive "wipe" sheet: solid ember confirm over a borderless cancel; `aria-disabled` disagreed with `disabled` on the confirm screen; the details chevron pointed right and never rotated. | Medium |

### Changed

- `ScreenShell` / `OnboardingTopBar`: a `step` prop renders "Étape n sur 5" in the bar; every
  funnel screen passes its step.
- `GoalWizard`: the programme step's Continue is always present and disabled until a DEC is
  picked; the goal step's Continue (with its live count) moved into the sticky footer and the
  skip became a text link; university chips and row/stamp stacks got real clearance; the DEC
  details chevron rotates.
- `ScoreScreen`: one solid primary row, two identical secondary rows, the "just the cutoffs"
  exit demoted to a text link; chips at 48px with 10px gaps; skeleton matches.
- `AccountScreen`: both states are `<form>`s with submit buttons, `name` attributes,
  `enterKeyHint`, and the OTP input autofocuses.
- `StartingScreen`: cancel first at full weight, the wipe as an ember outline.
- `EstimateScoreScreen`: `gap-3` around the delete, `type="text" inputMode="numeric"` for
  grades, `enterKeyHint` on both inputs, "Ajouter un cours" as a bordered button.
- `CegepScreen`: `enterKeyHint="search"`, and the empty result uses `EmptyState` with a clear
  action. `ConfirmScoreScreen`: `aria-disabled` dropped. `WelcomeScreen`: CTA at `h-14`.

## Signed-in app

### Found

| Law | Finding | Severity |
|---|---|---|
| Fitts / Jakob | Profile delete confirm and cancel: equal size, 8px apart, destructive on the left. | High |
| Fitts | Dashboard target row: 4px between the row link and a destructive remove. Counselor-prep `HostLink` ~15px tall, the most repeated link on the page. Sync toast close 36px. | High |
| Hick's | Profile: counselor-prep and logout as identical full-width buttons; ten tag pills in taxonomy order. Programmes list: three filter mechanisms with the reset hidden inside the empty state. Bursaries: every tier fully expanded. | High / Medium |
| Jakob | Notification settings: only the knob toggled, not the row. Inbox rows were anchors with `preventDefault` (no long-press, no new tab). What-if sheet: a blue "Fermer" as the call to action, stepper-only entry. | Medium |
| Fitts | Two `SourceStamp`s stacked 4px apart on the programme detail (overlapping hit boxes); date filter chips with no vertical gap when wrapped; `LangToggle` options touching; desktop nav links 27px. | Medium |
| Jakob | Inert metadata dressed as pills (`rounded-full`) on the programme detail, against the design rule "actions are pill". | Medium |

### Changed

- Profile: cancel first at `h-14`, delete as an ember outline below it, `gap-3`; counselor-prep
  is the one solid button, logout a quiet pill; tags sorted by how many bursaries ask for them;
  target rows `gap-3`.
- `TargetGoals` `gap-3`; `ImportantDates` `gap-y-1`; `ProgramDetail` second stamp `mt-3` and
  inert chips at the 3px structure radius; `LangToggle` `gap-0.5`; `TopNav` desktop links 44px;
  `BottomNav` labels 10px and strict active matching; `SyncErrorToast` close 44px;
  counselor-prep `HostLink` padded to 44px (reset for print).
- Programmes list: an `×` clears the search; a persistent "Effacer les filtres" appears whenever
  a filter is active; the visitor CTA is underlined.
- Bursaries: the "matched" tier stays open; "close" and "explore" open from a counted disclosure.
- `WhatIfSheet`: grades are typed directly (clamped) as well as stepped; the single footer
  action is Reset, since the sheet already closes from its X, backdrop and Escape.
- Notification settings: the whole row is the switch. Inbox rows are `next/link` links.
- `ScoreCard`: "Voir les paliers" is a quiet text affordance so the what-if is the one primary.
- `AddTargetButton`: the pressed state says "· Retirer" so a second tap is not a surprise.
- `Header` (legal and methodology pages): 48px nav links, 44px language button.

## Left for a later round

- **Goal step still offers four modes at once** (three choice rows, the suggestion list, and the
  footer). Anchoring the footer removed the worst of it; collapsing to one mode is a product
  decision, not a layout fix.
- **Programme list is still an unbounded flat list** in the wizard's "specific" view. Grouping by
  institution or virtualising it is a bigger change than this pass.
- **Counselor-prep bypasses `AppShell`**; probably deliberate for print, left alone.
- **A `Button` primitive** would retire the eight hand-copied `h-14` strings. Every fix here
  reused the existing class vocabulary instead of introducing one mid-pass.
- **Bilingual 404 copy** stays bilingual: the route has no locale segment to read.
