import { IDX_TICKERS } from "./idx-tickers";

export type OutputFormat = "tradingview" | "plain" | "newline";

export type InvalidToken = { token: string; reason: "length" | "chars" | "unknown" };
export type Delimiter = "tab" | "comma" | "semicolon" | "newline" | "space" | "mixed";

export type InputAnalysis = {
  valid: string[];
  invalid: InvalidToken[];
  duplicates: string[];
  delimiter: Delimiter | null;
};

export function analyzeInput(raw: string): InputAnalysis {
  if (!raw || !raw.trim()) {
    return { valid: [], invalid: [], duplicates: [], delimiter: null };
  }

  // Detect delimiter
  const hasTab = /\t/.test(raw);
  const hasComma = /,/.test(raw);
  const hasSemi = /;/.test(raw);
  const hasNl = /\n/.test(raw);
  const hasSpace = / /.test(raw);
  const delimsCount = [hasTab, hasComma, hasSemi, hasNl].filter(Boolean).length;
  let delimiter: Delimiter | null = null;
  if (delimsCount > 1) delimiter = "mixed";
  else if (hasTab) delimiter = "tab";
  else if (hasComma) delimiter = "comma";
  else if (hasSemi) delimiter = "semicolon";
  else if (hasNl) delimiter = "newline";
  else if (hasSpace) delimiter = "space";

  // Tokenize: split on anything that's not A-Z or 0-9 (after uppercasing).
  // This catches mangled input like "AMMN;;.;KIJA.;.;JPFA" cleanly.
  const tokens = raw
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: InvalidToken[] = [];
  const seen = new Set<string>();
  const dupSet = new Set<string>();

  for (const token of tokens) {
    if (!/^[A-Z]{4}$/.test(token)) {
      invalid.push({
        token,
        reason: /^[A-Z0-9]+$/.test(token) && token.length !== 4 ? "length" : "chars",
      });
      continue;
    }
    if (!IDX_TICKERS.has(token)) {
      invalid.push({ token, reason: "unknown" });
      continue;
    }
    if (seen.has(token)) {
      dupSet.add(token);
      continue;
    }
    seen.add(token);
    valid.push(token);
  }

  return { valid, invalid, duplicates: Array.from(dupSet), delimiter };
}

// Backwards-compat
export function parseTickers(input: string): string[] {
  return analyzeInput(input).valid;
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
