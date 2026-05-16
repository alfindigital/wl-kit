# WatchlistKit Revisions

## 1. Share image (ShareCard)
- Footer: replace `watchlistkit.com · by alfindigital` with just `@alfindigital`.
- Keep layout otherwise; adjust spacing.

## 2. Logo
- Replace amber square in `Header.tsx` with a custom inline SVG: magnifying glass (loop) containing a small stock chart silhouette (line + bars), outline style (stroke, no fill), using `currentColor` so it adapts to theme. Stroke width ~1.75.

## 3. Typography — voicenotes.com style
Voicenotes uses large, tight, serif-leaning display headings paired with clean sans body. Approach:
- Load **Instrument Serif** (display) + keep **Inter** (body) via Google Fonts in `__root.tsx`.
- Add `--font-display: "Instrument Serif"` token in `styles.css`.
- H1: switch to `font-display`, larger (text-5xl / sm:text-6xl), tighter tracking (`tracking-tight`), normal weight, line-height ~1.05. Italic accent on the highlighted word ("seconds.").
- Body/UI: Inter, smaller and lighter (`text-[15px]`, `font-normal`), muted.
- Remove the subtitle paragraph entirely ("Paste tickers in any format...").

## 4. Theme
- Default to **light mode** (update `getStoredTheme` default + inline boot script in `__root.tsx`).
- Recolor accent to a **bold orange** (not amber). Use `oklch(0.68 0.22 40)` ≈ #ea580c-ish vivid orange. Update both `:root` and `.dark` `--primary` and `--ring`.
- Light mode background stays warm off-white; ensure orange has strong contrast.

## 5. Header & Footer backgrounds
- Make them visibly distinct from page body.
  - Header: solid `bg-secondary` (or muted) with stronger bottom border, drop the heavy blur.
  - Footer: same `bg-secondary` with top border.
- Page body remains `bg-background` so the contrast reads clearly in both themes.

## 6. Keyboard shortcuts
Add a `useEffect` in `src/routes/index.tsx` with a global `keydown` listener (ignore when typing in input/textarea except where noted):
- `⌘/Ctrl + Enter` — copy current output (works from textarea too).
- `⌘/Ctrl + K` — focus the ticker textarea + select all.
- `⌘/Ctrl + S` — open Save dialog (prevent default).
- `⌘/Ctrl + 1 / 2 / 3` — switch format to TradingView / Plain / Newline.
- `Esc` — clear input when focused.

Add a small "Shortcuts" hint row under the action buttons (muted, mono small text) listing the main ones. Use `kbd` styling.

## 7. Footer text
- Change `Telegram` link label from `Telegram` to `@AlfIDX` (URL unchanged: `https://t.me/alfidx`).

## Files to edit
- `src/styles.css` — orange primary, font-display token.
- `src/routes/__root.tsx` — add Instrument Serif font link, default light mode boot script.
- `src/lib/theme.ts` — default to `"light"`.
- `src/components/watchlist/Header.tsx` — new SVG logo, solid bg.
- `src/components/watchlist/Footer.tsx` — solid bg, `@AlfIDX` label.
- `src/components/watchlist/ShareCard.tsx` — footer text → `@alfindigital`.
- `src/routes/index.tsx` — typography overhaul, remove subtitle, keyboard shortcuts, shortcut hint.

No new dependencies. No backend changes.
