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
export const MAX_WATCHLISTS = 20;

export function loadWatchlists(): SavedWatchlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map((w: SavedWatchlist) => ({
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
  localStorage.setItem(KEY, JSON.stringify(list));
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
