# Motion: how the app moves

The rule is one feel everywhere: short, decelerating, compositor-only (opacity and transform),
and nothing appears or vanishes in a single frame. Tempo is the subtle end: 140ms presses,
180 to 240ms arrivals, 200ms exits. `prefers-reduced-motion` collapses all of it to near-zero
through the global rule in `globals.css`.

## Vocabulary (`src/app/globals.css`)

Declared as `--animate-*` theme values, so Tailwind emits them as utilities and variants like
`backdrop:` work on them. (They used to be plain `.animate-*` classes, which is why the sheet's
backdrop fade never actually ran.)

| Utility | Use |
|---|---|
| `animate-content-in` | Screen content arriving: fade + 4px rise, 200ms. |
| `stagger-in` | On a column of cards: children arrive 40ms apart, capped at 200ms. |
| `animate-sheet-up` / `animate-sheet-down` | Bottom sheet entrance and exit. |
| `animate-backdrop-fade` / `animate-backdrop-out` | The sheet's backdrop, both directions. |
| `animate-scale-in` | Toasts and small overlays. |
| `animate-pop-in` | A confirmed state (check mark, "copied"). |
| `tap-spring` | Every press. 140ms, scale 0.97. The hand-rolled `transition-transform active:scale-[…]` variants were folded into it. |

`details[open] > :not(summary)` fades its body in, so disclosures (FAQ, bursary tiers, the
DEC card) open without a snap.

## Screen changes

`ContentTransition` (`src/components/app-shell/ContentTransition.tsx`) is the one screen-change
mechanism. Both shells wrap their content in it, never the fixed bars:

- Keyed on the route, so a tab switch or a detail push fades the new screen in.
- Mounted fresh when a skeleton hands over to the real page, so that swap fades in too.
- Raises the app-ready flag (below) unless the shell was rendered as a `skeleton`.

React 19.2 stable has no `<ViewTransition>` export and the Next flag needs it, so this is CSS
on mount rather than the View Transitions API. When that lands, this wrapper is where it goes.

## Launch

Three surfaces, one colour (chalk, `#E7E9E0`), so nothing flashes between them:

1. **Native iOS** (Capacitor): the launch storyboard background is chalk instead of
   `systemBackgroundColor` (black in dark mode), `UIUserInterfaceStyle` is `Light`, the launch
   image is a solid chalk square instead of the stock Capacitor splash, and the web view's
   `backgroundColor` is chalk while the remote app loads.
2. **Home-screen PWA on iOS**: `colorScheme: "light"` in the root viewport. Without it iOS
   painted the launch frame black in dark mode before any of our bytes arrived.
3. **Boot splash** (`BootSplash.tsx`): ready-gated. It plays at least 700ms so the mark and dot
   animations finish, then fades the moment the first real screen has rendered (the flag in
   `src/lib/boot-ready.ts`, raised by `ContentTransition`). A 2.6s cap ends it regardless, and
   a CSS-only fade at 3s runs even if hydration never happens.

## Sheets

`Sheet` keeps the `<dialog>` open for 200ms after `open` flips to false and plays the exit
animation in that window; the classes derive from `open`, so a reopen inside the window just
flips back to the entrance. `dialog.close()` used to be instant.
