
# WatchlistKit — UX, Feature & Mobile Overhaul

Comprehensive revision covering UX, new features, layout, and mobile. Single-page app, no backend, all client-side.

---

## A. Header & Layout

### A1. Remove top header entirely
- Delete `<Header />` usage from `src/routes/index.tsx`.
- Drop `theme`/`toggleTheme` state, the `Header.tsx` import, and the `Moon/Sun` toggle. Keep light mode as the only theme (remove dark-mode toggle UI; `.dark` styles in `styles.css` can stay unused).
- File `src/components/watchlist/Header.tsx` no longer imported — leave the file but unused, or delete. Plan: delete it to keep tree clean.
- Main container top padding reduced so content sits closer to the top (`pt-6 sm:pt-10` instead of `py-10 sm:py-14`).

### A2. Hero shrink
- Current `text-5xl sm:text-6xl` is too tall. New: `text-2xl sm:text-3xl`, `font-display`, `leading-tight`, centered, single line where possible: `Format your IDX watchlist <em>in seconds.</em>`.
- Remove the `<br/>` so it can wrap naturally on narrow screens.
- Reduce vertical margin: `mb-5 sm:mb-6`.

---

## B. Input UX (Section A in user message)

### B1. Auto-focus textarea on load
- Add `autoFocus` to `<Textarea>` in `TickerInput.tsx`, plus `ref.current?.focus()` in a `useEffect` on mount in `index.tsx` (skip if `?t=` query is present or saved input is loaded).

### B2. Clear button (X icon) inside textarea
- Wrap `<Textarea>` in a relative div. Render an `X` icon button (top-right corner of the textarea, `absolute top-2 right-2`) when `value.length > 0`. Click → `onChange("")` and refocus.

### B3. Paste button
- Below or next to the textarea (top-right, beside the X), add a `Clipboard` icon button labeled `Paste`. Uses `navigator.clipboard.readText()` → appends/replaces input. Handle permission failures with toast.
- Hidden on devices without Clipboard API.

### B4. Auto-grow textarea
- Replace fixed `min-h-[160px]` with auto-grow: mobile `min-h-[96px]` (~3-4 rows), desktop `min-h-[140px]`. On `onChange`, `el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'` capped at e.g. `360px`. Keep `resize-y` removed in favor of auto.

### B5. Keyboard shortcuts additions
- Existing: ⌘/Ctrl+Enter copy, ⌘/Ctrl+K focus, ⌘/Ctrl+S save, ⌘/Ctrl+1/2/3 format, Esc clear.
- Add:
  - When NOT in input: ⌘/Ctrl+V → focus textarea (browser native paste then handles).
  - ⌘/Ctrl+Shift+C → copy from output (alias for current copy, but explicit "copy output").
  - ⌘/Ctrl+D → download as TXT (see C1).
- Update `ShortcutHint` row to show: Copy, Paste, Save, Download, Format, Clear.

---

## C. Features (Section B in user message)

### C1. Download as TXT
- New action button `Download`. Generates a `Blob([output], {type:'text/plain'})`, file name `watchlistkit-<name|date>.txt`.
- Bound to ⌘/Ctrl+D.

### C2. Action buttons restructure
- Primary `Copy` button: full-width, prominent, larger (`h-11`, primary color).
- Secondary actions collapsed into icon-only row of small buttons: `Save`, `Download`, `Image`, `Share` — equal-size icon buttons with tooltip labels, in a single row (4 cols on mobile, inline on desktop).
- Layout: `Copy` on top spanning full width, secondary row beneath. Removes the cramped 4-up grid.

### C3. Output block improvements
- **Line numbers for Newline format only**: prefix each line with a muted `01  BBCA`-style gutter using a CSS grid (line numbers in `text-muted-foreground` column, content in normal column). Non-newline formats render as today.
- **Empty state**: change `"Your formatted tickers will appear here…"` → `"Paste tickers above to start"`.

### C4. Saved watchlists — Rename
- In `SavedWatchlists.tsx`, add `Pencil` icon button alongside Trash. Opens an inline rename input (or reuse a small dialog) → updates `name` and bumps `savedAt`. Persist via `saveWatchlists`.
- Add `onRename(id, name)` prop wired in `index.tsx`.

### C5. Saved watchlists — Search/filter
- Add a small `<Input>` above the list with `Search` icon when `items.length > 5`. Filters by name (case-insensitive) and by ticker membership (typing `BBCA` shows watchlists containing it).

### C6. Saved watchlists — Merge
- "Select" mode toggle on the saved list. Checkboxes appear next to each item. With 2+ selected, show a `Merge` button → opens dialog asking for a new name, then creates a new watchlist whose tickers are the deduplicated union (preserve order: first occurrence wins). Toast count.
- Originals not deleted.

### C7. Saved watchlists — Diff
- In select mode, with exactly 2 selected, show a `Compare` button → opens dialog showing:
  - `Added` (in B not A): green chips
  - `Removed` (in A not B): red chips
  - `Unchanged`: muted chips
- Order of A vs B: first selected = A (older state), second = B (new state). Show small legend.

### C8. Accent color consistency audit
- Verify all interactive states use `--primary` (focus rings, active tab, hover on buttons). In particular:
  - `TickerInput` focus ring already uses `ring-primary` ✓.
  - `FormatTabs` active state — verify shadcn `TabsTrigger` data-state=active uses primary; if not, add `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`.
  - Icon buttons hover → `hover:text-primary`.
  - Link hovers in footer → `hover:text-primary` (currently `hover:text-foreground`).

---

## D. Mobile

### D1. Action button grid
- Already handled in C2: primary `Copy` full-width + 4 small icon buttons row. On mobile this collapses neatly (icon-only, 4 cols). On desktop, icon+label horizontal.

### D2. Toast position
- Update `<Toaster />` in `__root.tsx` (or wherever rendered): `position="top-center"` so toasts don't cover the bottom action buttons on mobile. Confirm sonner Toaster props.

### D3. Saved WL swipe-to-delete
- In `SavedWatchlists.tsx`, add touch handlers on each row: track `touchstart`/`touchmove` deltaX. Translate row left up to ~80px revealing a Delete background. On release, if past threshold → trigger delete confirmation; else snap back. Pure React, no library. Keep the visible Trash button as fallback for desktop.

### D4. Bottom safe area for footer
- Footer: add `pb-[env(safe-area-inset-bottom)]` and ensure body uses `min-h-screen` with `flex-col` (already does).
- Sticky behavior: footer currently is NOT sticky; it sits at end of flex column — fine. Just ensure safe area inset is respected on iOS.

### D5. Native Web Share API
- `handleShare`: if `navigator.share` exists, call it with `{title, text: output, url}`. Fallback to current copy-link behavior. Use `await navigator.share(...)` with try/catch (ignore AbortError).

---

## E. Files to touch

- `src/routes/index.tsx` — remove header, hero shrink, autofocus, shortcut additions (V, Shift+C, D), share API, download TXT, rename/merge/diff handlers, ShortcutHint update.
- `src/components/watchlist/TickerInput.tsx` — clear X, paste button, auto-grow, autoFocus ref.
- `src/components/watchlist/ActionButtons.tsx` — restructure: primary Copy + secondary icon row, add Download.
- `src/components/watchlist/OutputBlock.tsx` — line numbers for newline format, new empty text.
- `src/components/watchlist/SavedWatchlists.tsx` — rename, search input, select mode, merge button, compare button, swipe-to-delete.
- `src/components/watchlist/Footer.tsx` — safe-area padding, hover color → primary.
- `src/components/watchlist/FormatTabs.tsx` — ensure active state uses primary.
- `src/components/watchlist/ShareCard.tsx` — already updated to `@alfindigital`; verify accent square uses orange (`#ea580c`) not amber.
- `src/lib/storage.ts` — add `renameWatchlist`, `mergeWatchlists` helpers (optional; logic can live in index).
- `src/lib/tickers.ts` — add `diffTickers(a, b)` returning `{added, removed, unchanged}`.
- `src/routes/__root.tsx` — Toaster `position="top-center"`; remove dark theme boot if any leftovers.
- Delete `src/components/watchlist/Header.tsx`.

No new dependencies.

---

## F. Out of scope (per user)

- No backend, no AI, no extra routes.
- Dark mode toggle removed (light only). `.dark` CSS retained but inert.

