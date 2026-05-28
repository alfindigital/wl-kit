## Changes

### 1. Onboarding — add 2 more steps
Update `OnboardingTour` steps in `src/routes/index.tsx` to 5 total:
1. Paste tickers (existing — `inputStepRef`)
2. Format & preview (existing — `formatStepRef`)
3. Copy / Save / Share actions (existing — `actionStepRef`)
4. **New**: Saved Watchlists section — explain saving, pinning, tagging, merging, comparing.
5. **New**: Help & shortcuts button (top-right `?`/`HelpCircle`) — explain keyboard shortcuts overlay.

Add two new refs: `savedStepRef` (wrap `<SavedWatchlists>` div) and `helpStepRef` (wrap the desktop floating `HelpCircle` button — also use the same ref for the mobile header button, or pick the visible one based on viewport; simplest: attach a single ref to the desktop control container, fall back gracefully).

All copy in English. Each step has clear, short title + body.

### 2. Remove bottom keyboard shortcut hint
Delete `<ShortcutHint />` usage (line 616–618) and the `ShortcutHint` + `Kbd` helper functions (lines 772–810) from `src/routes/index.tsx`. The `?` overlay already covers this.

### 3. Branding = "WatchlistKit" everywhere
Audit and confirm all visible strings say `WatchlistKit` (one word, capital W and K). Already correct in most places — verify Footer, ShareCard, ShortcutOverlay, and any leftover strings. Update if any drift found.

### 4. OG image → WatchlistKit-branded
Generate a new branded OG image (1200×630) via `imagegen` with the WatchlistKit wordmark, tagline "Free IDX Watchlist Formatter", orange accent matching the brand. Save to `src/assets/og-image.jpg`. Update `og:image` and `twitter:image` in `src/routes/__root.tsx` to use the new asset (imported as URL). Remove the old R2 preview-screenshot URL.

### 5. Input — drop red invalid styling + invalid count
In `src/components/watchlist/InputStats.tsx`:
- Remove the "N invalid" toggle button and the expandable invalid chip list entirely.
- Keep only `validCount` and `duplicates removed`.
- Remove the `invalid` prop usage (still accept it for now to avoid breaking the call site, but ignore — or remove prop and update caller in `index.tsx`).

In `src/components/watchlist/TickerInput.tsx`: nothing red on invalid is currently set per-token, but verify no border-destructive triggers from invalid state. (Drag border stays primary.)

### 6. Smaller textarea (1–2 lines shorter on desktop)
In `src/components/watchlist/TickerInput.tsx`: change `min-h-[120px] ... sm:min-h-[160px]` → `min-h-[96px] ... sm:min-h-[112px]` so on desktop the field fits in one viewport with the rest. Keep auto-grow behaviour.

### 7. Sort feature (A–Z / Z–A)
Add a sort control to `OutputBlock` header (next to the count badge / copy button):
- New `ArrowUpDown` icon button → opens a small `Popover` with two options: "A → Z" and "Z → A" (and an implicit "Original" reset via re-pasting; optional "Default" reset).
- Lift state: add `sortMode: "none" | "asc" | "desc"` in `index.tsx`. When non-`none`, apply `[...tickers].sort()` (asc) or reverse before passing to `formatTickers`. The `tickers` array fed to `output`, `ShareCard`, `handleSave`, `handleShare`, etc. should all use the sorted array so what the user sees is what they save/share.
- Popover uses existing shadcn `Popover` component; styling matches existing ghost icon buttons (`h-7 w-7 rounded-lg text-muted-foreground hover:text-primary`).

### 8. Remove "Input" / "Output" labels
- In `src/components/watchlist/TickerInput.tsx`: remove the `<span>Input</span>` label from the footer bar — keep the right-side icon buttons (paste / clear) on a slim row.
- In `src/components/watchlist/OutputBlock.tsx`: remove the `<span>Output</span>` label — keep the ticker-count badge + copy button (now also sort button) on the right.
- Visual rhythm preserved by keeping the bordered header row with right-aligned controls.

## Files touched
- `src/routes/index.tsx` — onboarding steps (+2), remove `ShortcutHint`, sort state, pass sorted tickers downstream.
- `src/components/watchlist/OnboardingTour.tsx` — no API change (steps are passed in).
- `src/components/watchlist/InputStats.tsx` — remove invalid UI.
- `src/components/watchlist/TickerInput.tsx` — smaller min-height, remove "Input" label.
- `src/components/watchlist/OutputBlock.tsx` — remove "Output" label, add sort Popover button, accept `sortMode` + `onSortChange` props.
- `src/routes/__root.tsx` — swap `og:image` / `twitter:image` URLs.
- `src/assets/og-image.jpg` — new generated asset.

## Out of scope
- No backend / data shape changes.
- No changes to keyboard-shortcut overlay contents (already complete).
- Sort does not persist across reloads.
