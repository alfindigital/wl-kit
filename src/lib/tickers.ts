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
