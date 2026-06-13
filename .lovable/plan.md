# Fix mobile responsiveness

## Problem
On mobile (≤640px), the Saved Watchlists toolbar in `src/components/watchlist/SavedWatchlists.tsx` collapses into a vertical stack — sort, select, and export/import each take their own row because the container uses `flex flex-col … sm:flex-row`. The result looks broken (see screenshot).

## Fix

### `src/components/watchlist/SavedWatchlists.tsx` (toolbar, ~line 565)
Restructure the toolbar so the action buttons stay on one row on every viewport, while the search input gets its own full-width row on mobile.

Change the outer container from:
```
flex flex-col gap-2 ... sm:flex-row sm:items-center
```
to a wrapping row that keeps the search on its own line on mobile:

- Outer: `flex flex-wrap items-center gap-2 px-2 pb-2 pt-1`
- Search wrapper: `w-full sm:flex-1 sm:w-auto` (full width on mobile, flexes on ≥sm)
- Group the remaining controls (sort dropdown + select/cancel cluster + export/import cluster) inside a single `flex flex-1 items-center gap-2` row so they sit side-by-side on mobile
- Keep `ml-auto` on the export/import cluster so it pushes right on all sizes (drop the `sm:` prefix)

Result on mobile (390px):
```
[ search input full-width                  ]
[ ⇅ ] [ ☑ ]                       [ ⬇ ] [ ⬆ ]
```
On ≥sm it stays as today: search flexes, all buttons trail on the same row.

### Footer audit — `src/components/watchlist/Footer.tsx`
At 390px the footer already wraps (copyright on top, socials below) which is acceptable. No structural change; only verify the rotator `min-width: 200px` does not overflow the viewport with safe-area padding. If needed, reduce `.afd-rot` `min-width` to `180px` and let it remain `flex-wrap` friendly.

## Out of scope
No business-logic changes. Visuals, icons, and behavior unchanged — only flex direction and wrapping rules.
