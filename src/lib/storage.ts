export type SavedWatchlist = {
  id: string;
  name: string;
  tickers: string[];
  savedAt: number;
  pinned?: boolean;
  tags?: string[];
  lastUsedAt?: number;
};

const KEY = "watchlistkit.saved";
export const SCHEMA_VERSION = 1;
export const MAX_WATCHLISTS = 20;

export function loadWatchlists(): SavedWatchlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support legacy (array) and versioned ({version, watchlists}) shapes.
    let list: unknown;
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === "object") {
      const v = (parsed as { version?: number }).version;
      if (typeof v === "number" && v > SCHEMA_VERSION) {
        // Newer schema written by a future app version — refuse to corrupt it.
        console.warn("[storage] saved watchlists schema is newer than supported; skipping read");
        return [];
      }
      list = (parsed as { watchlists?: unknown }).watchlists;
    }
    if (!Array.isArray(list)) return [];
    return (list as SavedWatchlist[]).map((w) => ({
      pinned: false,
      tags: [],
      lastUsedAt: w.savedAt,
      ...w,
    }));
  } catch {
    return [];
  }
}

export function saveWatchlists(list: SavedWatchlist[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: SCHEMA_VERSION, watchlists: list }),
    );
  } catch (e) {
    const err = e as { name?: string };
    if (err?.name === "QuotaExceededError") {
      console.warn("[storage] quota exceeded — watchlist not saved");
    } else {
      console.warn("[storage] failed to save watchlists", e);
    }
  }
}

export function exportAllJSON(list: SavedWatchlist[]): string {
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), watchlists: list },
    null,
    2,
  );
}

export function importAllJSON(
  current: SavedWatchlist[],
  json: string,
): { merged: SavedWatchlist[]; added: number; skipped: number } {
  const parsed = JSON.parse(json);
  const incoming: SavedWatchlist[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.watchlists)
      ? parsed.watchlists
      : [];
  const ids = new Set(current.map((w) => w.id));
  let added = 0;
  let skipped = 0;
  const toAdd: SavedWatchlist[] = [];
  for (const w of incoming) {
    if (!w || typeof w !== "object" || !w.id || !Array.isArray(w.tickers)) {
      skipped++;
      continue;
    }
    if (ids.has(w.id)) {
      skipped++;
      continue;
    }
    toAdd.push({
      id: w.id,
      name: String(w.name || "Imported"),
      tickers: w.tickers.filter((t: unknown) => typeof t === "string"),
      savedAt: Number(w.savedAt) || Date.now(),
      pinned: !!w.pinned,
      tags: Array.isArray(w.tags) ? w.tags.map(String) : [],
      lastUsedAt: Number(w.lastUsedAt) || Number(w.savedAt) || Date.now(),
    });
    added++;
  }
  return { merged: [...toAdd, ...current], added, skipped };
}
