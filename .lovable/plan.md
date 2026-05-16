# WatchlistKit Build Plan

A single-page React app that parses messy IDX ticker input into clean formatted output, with save/share/export features. All client-side, no backend.

## Scope

- One route: `/` (home). No auth, no Cloud, no API calls.
- Reads `?t=BBCA,BMRI,...` query param on load to prefill input.
- All persistence via `localStorage` (theme, saved watchlists).

## Files

```
src/routes/index.tsx                 — main page (replaces placeholder)
src/components/watchlist/
  Header.tsx                         — sticky header + theme toggle
  Footer.tsx                         — sticky footer with alfindigital links
  TickerInput.tsx                    — large textarea
  FormatTabs.tsx                     — TradingView / Plain / Newline
  OutputBlock.tsx                    — mono code block + ticker count badge
  ActionButtons.tsx                  — Copy / Save / Save as Image / Share
  SaveDialog.tsx                     — name-watchlist dialog
  SavedWatchlists.tsx                — collapsible list with load/delete
  ShareCard.tsx                      — off-screen branded card for PNG export
src/lib/
  tickers.ts                         — parse, dedupe, format (3 variants)
  storage.ts                         — typed localStorage helpers (theme, watchlists)
  theme.ts                           — apply/toggle .dark on <html>
src/styles.css                       — add brand tokens (navy + amber accent), Inter font
src/routes/__root.tsx                — update <title>/meta + theme bootstrap script
```

## Core logic

- **Parse:** `input.match(/\b[A-Z]{4}\b/g)` → dedupe preserving order. Silently drops everything else.
- **Formats:**
  - TradingView: `IDX:BBCA,IDX:BMRI,...`
  - Plain: `BBCA,BMRI,...`
  - Newline: one per line
- **Live preview:** `useMemo` over input + format. No submit button.
- **Auto-copy on format change:** when the user switches tabs (not on every keystroke), write to clipboard + toast.
- **Share URL:** `${origin}/?t=${tickers.join(',')}`, copy to clipboard.
- **Save as Image:** use `html-to-image` (Worker-safe, pure JS) to render `ShareCard` → PNG download. Card shows logo, watchlist name (or "My Watchlist"), formatted tickers, date (`16 May 2026`), footer `watchlistkit.com · by alfindigital`.
- **Saved watchlists:** array in localStorage, cap at 20, warn on limit. Each entry: `{ id, name, tickers, savedAt }`.

## Design

- Palette: deep navy base `#0f172a` (dark) / warm off-white (light), amber accent `#f59e0b`. Defined as oklch tokens in `src/styles.css` (`--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--border`, etc.) for both `:root` and `.dark`. Default mode = dark.
- Inter font via Google Fonts link in `__root.tsx`.
- Generous whitespace, rounded-2xl cards, subtle shadows, smooth transitions. Max-width ~640px centered content column. Mobile-first.
- shadcn primitives: `tabs`, `button`, `textarea`, `dialog`, `sonner` (toast), `collapsible`, `badge`.

## SEO

In `src/routes/index.tsx` `head()`:
- title: `WatchlistKit — IDX Watchlist Formatter`
- description: `Format your IDX watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or newline-separated lists.`
- og:title, og:description, og:url=`/`, canonical=`/`.

## Dependencies to add

- `html-to-image` (PNG export; pure JS, no native deps)

## Out of scope

- No backend, no Lovable Cloud, no analytics, no extra routes.

## Verification

After build: load `/`, paste mixed input → check live parse + 3 formats; toggle dark/light; save a watchlist → reload → load it back; share URL round-trip via `?t=`; download PNG and confirm it renders.