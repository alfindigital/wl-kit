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
        // Newer schema written by a future app version - refuse to corrupt it.
        if (import.meta.env.DEV)
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
    localStorage.setItem(KEY, JSON.stringify({ version: SCHEMA_VERSION, watchlists: list }));
  } catch (e) {
    const err = e as { name?: string };
    const reason = err?.name === "QuotaExceededError" ? "quota" : "other";
    if (import.meta.env.DEV) {
      if (reason === "quota") {
        console.warn("[storage] quota exceeded, watchlist not saved");
      } else {
        console.warn("[storage] failed to save watchlists", e);
      }
    }

    try {
      window.dispatchEvent(
        new CustomEvent("wlkit:storage-error", { detail: { reason, scope: "watchlists" } }),
      );
    } catch {
      // ignore
    }
  }
}

export const STORAGE_KEYS = { watchlists: KEY } as const;

// ---------- Unified .txt import/export format ----------
// Human-readable, systematic, round-trippable.
//
//   # WatchlistKit Export
//   # version: 1
//   # exportedAt: <ISO>
//
//   ## <name>
//   # id: <id>
//   # savedAt: <ms>
//   # pinned: true|false
//   TICKER, TICKER, TICKER
//
// Sections are separated by "## <name>". Metadata lines start with "#".
// Ticker lines may use commas, spaces, or newlines as separators.

export const EXPORT_FORMAT_VERSION = 1;

export function exportAllTXT(list: SavedWatchlist[]): string {
  const lines: string[] = [];
  lines.push("# WatchlistKit Export");
  lines.push(`# version: ${EXPORT_FORMAT_VERSION}`);
  lines.push(`# exportedAt: ${new Date().toISOString()}`);
  lines.push(`# total: ${list.length}`);
  for (const w of list) {
    lines.push("");
    lines.push(`## ${w.name}`);
    lines.push(`# id: ${w.id}`);
    lines.push(`# savedAt: ${w.savedAt}`);
    if (w.pinned) lines.push(`# pinned: true`);
    if (w.lastUsedAt) lines.push(`# lastUsedAt: ${w.lastUsedAt}`);
    lines.push(w.tickers.join(", "));
  }
  return lines.join("\n") + "\n";
}

function parseTXT(text: string): SavedWatchlist[] {
  const out: SavedWatchlist[] = [];
  const lines = text.split(/\r?\n/);
  let cur: (Partial<SavedWatchlist> & { tickers: string[] }) | null = null;
  const flush = () => {
    if (cur && cur.name) {
      out.push({
        id: cur.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: cur.name,
        tickers: cur.tickers,
        savedAt: cur.savedAt || Date.now(),
        pinned: !!cur.pinned,
        tags: [],
        lastUsedAt: cur.lastUsedAt || cur.savedAt || Date.now(),
      });
    }
    cur = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flush();
      cur = { name: line.slice(3).trim(), tickers: [] };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("#")) {
      const m = line.match(/^#\s*(\w+)\s*:\s*(.+)$/);
      if (m) {
        const [, key, val] = m;
        if (key === "id") cur.id = val.trim();
        else if (key === "savedAt") cur.savedAt = Number(val) || undefined;
        else if (key === "lastUsedAt") cur.lastUsedAt = Number(val) || undefined;
        else if (key === "pinned") cur.pinned = val.trim() === "true";
      }
      continue;
    }
    if (!line) continue;
    const tickers = line
      .split(/[,\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    cur.tickers.push(...tickers);
  }
  flush();
  return out;
}

export function importAllTXT(
  current: SavedWatchlist[],
  text: string,
): { merged: SavedWatchlist[]; added: number; skipped: number } {
  // Auto-detect: legacy JSON exports still parse, for backward compatibility.
  let incoming: SavedWatchlist[] = [];
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : parsed?.watchlists;
      if (Array.isArray(arr)) {
        incoming = arr.filter(
          (w: unknown) =>
            !!w && typeof w === "object" && Array.isArray((w as SavedWatchlist).tickers),
        ) as SavedWatchlist[];
      }
    } catch {
      // fall through to text parser
    }
  }
  if (incoming.length === 0) incoming = parseTXT(text);

  const ids = new Set(current.map((w) => w.id));
  let added = 0;
  let skipped = 0;
  const toAdd: SavedWatchlist[] = [];
  for (const w of incoming) {
    if (!w || !Array.isArray(w.tickers) || w.tickers.length === 0) {
      skipped++;
      continue;
    }
    if (w.id && ids.has(w.id)) {
      skipped++;
      continue;
    }
    const id = w.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    ids.add(id);
    toAdd.push({
      id,
      name: String(w.name || "Imported"),
      tickers: w.tickers.filter((t: unknown) => typeof t === "string"),
      savedAt: Number(w.savedAt) || Date.now(),
      pinned: !!w.pinned,
      tags: [],
      lastUsedAt: Number(w.lastUsedAt) || Number(w.savedAt) || Date.now(),
    });
    added++;
  }
  return { merged: [...toAdd, ...current], added, skipped };
}
