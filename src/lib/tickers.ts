export type OutputFormat = "tradingview" | "plain" | "newline";

export function parseTickers(input: string): string[] {
  const matches = input.toUpperCase().match(/\b[A-Z]{4}\b/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of matches) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export function formatTickers(tickers: string[], format: OutputFormat): string {
  if (tickers.length === 0) return "";
  switch (format) {
    case "tradingview":
      return tickers.map((t) => `IDX:${t}`).join(",");
    case "plain":
      return tickers.join(",");
    case "newline":
      return tickers.join("\n");
  }
}

export function diffTickers(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  const added = b.filter((t) => !A.has(t));
  const removed = a.filter((t) => !B.has(t));
  const unchanged = a.filter((t) => B.has(t));
  return { added, removed, unchanged };
}

export function mergeTickers(lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const t of list) {
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
  }
  return out;
}
