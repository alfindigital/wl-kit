# WatchlistKit

Free IDX (Indonesia Stock Exchange) stock watchlist formatter. Paste tickers in
any format and export them to TradingView, plain text, or a newline list — then
save and share. No sign-up, no limits, no ads. Everything runs in the browser
and watchlists are stored locally.

Live: https://wlkit.lovable.app

## Features

- **Smart parsing** — accepts tickers separated by commas, spaces, tabs,
  semicolons, or newlines, including messy input pasted from PDFs and
  spreadsheets.
- **IDX validation** — every token is checked against the official IDX symbol
  list; unknown, malformed, and duplicate tickers are flagged.
- **Multiple export formats** — TradingView (`IDX:BBCA,IDX:BBRI,…`), plain
  comma-separated, or one-per-line.
- **Save & manage** — store up to 20 named watchlists locally, pin, tag, sort,
  and diff them. Import/export everything as a round-trippable `.txt` file.
- **Share** — generate a share link (with QR code) that preloads tickers, or
  export a watchlist as a PNG image.
- **PWA** — installable, offline-capable service worker, light/dark theme.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR) on
  [Cloudflare Workers](https://workers.cloudflare.com/)
- [Vite 7](https://vite.dev/) build
- [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) primitives
- [Zod](https://zod.dev/) for search-param validation
- TypeScript throughout

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

Then open the printed local URL.

## Scripts

| Script            | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start the Vite dev server              |
| `npm run build`   | Production build (client + SSR worker) |
| `npm run preview` | Preview the production build locally   |
| `npm run lint`    | ESLint + Prettier check                |
| `npm run format`  | Format the codebase with Prettier      |
| `npm run test`    | Run the unit test suite (Vitest)       |

## Project structure

```
src/
  routes/        # File-based routes (index, guide, sitemap, __root)
  components/
    ui/          # Radix-based design-system primitives
    watchlist/   # App-specific feature components
  lib/           # Pure logic: ticker parsing, storage, IDX symbol list
  router.tsx     # Router + QueryClient setup
  server.ts      # Cloudflare Worker entry (security headers, error handling)
  start.ts       # TanStack Start middleware
```

The core ticker logic lives in `src/lib/tickers.ts` and is fully unit-tested in
`src/lib/tickers.test.ts`. Persistence and the `.txt` import/export format live
in `src/lib/storage.ts` (`src/lib/storage.test.ts`).

## Deployment

The app is configured for Cloudflare Workers via `wrangler.jsonc`. A production
build is produced with `npm run build`; the Worker entry is `src/server.ts`.

## License

Made by [alfindigital](https://alfindigital.com).
