export type SavedWatchlist = {
  id: string;
  name: string;
  tickers: string[];
  savedAt: number;
};

const KEY = "watchlistkit.saved";
export const MAX_WATCHLISTS = 20;

export function loadWatchlists(): SavedWatchlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveWatchlists(list: SavedWatchlist[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}
