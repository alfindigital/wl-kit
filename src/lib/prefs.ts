import type { ExchangePrefix } from "@/components/watchlist/ExchangePrefix";

const KEY = "wlkit.defaultPrefix";

export const DEFAULT_PREFIX: ExchangePrefix = "IDX:";

export function isExchangePrefix(v: unknown): v is ExchangePrefix {
  return typeof v === "string" && ["", "IDX:", "BINANCE:"].includes(v);
}

export function loadDefaultPrefix(): ExchangePrefix {
  if (typeof window === "undefined") return DEFAULT_PREFIX;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULT_PREFIX;
    return isExchangePrefix(raw) ? raw : DEFAULT_PREFIX;
  } catch {
    return DEFAULT_PREFIX;
  }
}

export function saveDefaultPrefix(p: ExchangePrefix): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, p);
  } catch {
    // storage blocked / full - preference just won't persist
  }
}
