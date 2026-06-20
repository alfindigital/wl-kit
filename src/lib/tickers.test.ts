import { describe, expect, it } from "vitest";
import {
  analyzeInput,
  parseTickers,
  formatTickers,
  diffTickers,
  mergeTickers,
  suggestTickers,
} from "./tickers";

describe("analyzeInput", () => {
  it("returns empty result for blank input", () => {
    expect(analyzeInput("")).toEqual({
      valid: [],
      invalid: [],
      duplicates: [],
      delimiter: null,
    });
    expect(analyzeInput("   \n  ").valid).toEqual([]);
  });

  it("parses valid IDX tickers regardless of case and surrounding noise", () => {
    const { valid } = analyzeInput("bbca, BBRI tlkm");
    expect(valid).toEqual(["BBCA", "BBRI", "TLKM"]);
  });

  it("splits on any non-alphanumeric run, including mangled separators", () => {
    const { valid } = analyzeInput("AMMN;;.;KIJA.;.;JPFA");
    expect(valid).toEqual(["AMMN", "KIJA", "JPFA"]);
  });

  it("flags tokens of the wrong length as 'length'", () => {
    const { invalid } = analyzeInput("BBC");
    expect(invalid).toEqual([{ token: "BBC", reason: "length" }]);
  });

  it("flags 4-letter tokens that are not on the IDX list as 'unknown'", () => {
    const { invalid } = analyzeInput("ZZZZ");
    expect(invalid).toEqual([{ token: "ZZZZ", reason: "unknown" }]);
  });

  it("collects duplicates once and keeps the first occurrence valid", () => {
    const { valid, duplicates } = analyzeInput("BBCA BBCA BBRI BBCA");
    expect(valid).toEqual(["BBCA", "BBRI"]);
    expect(duplicates).toEqual(["BBCA"]);
  });

  it("detects mixed delimiters", () => {
    expect(analyzeInput("BBCA,BBRI\nTLKM").delimiter).toBe("mixed");
    expect(analyzeInput("BBCA,BBRI").delimiter).toBe("comma");
    expect(analyzeInput("BBCA BBRI").delimiter).toBe("space");
  });
});

describe("parseTickers", () => {
  it("returns only the valid tickers (backwards-compat helper)", () => {
    expect(parseTickers("BBCA, ZZZZ, BBRI")).toEqual(["BBCA", "BBRI"]);
  });
});

describe("suggestTickers", () => {
  it("returns nothing for prefixes shorter than 2 or longer than 3 chars", () => {
    expect(suggestTickers("")).toEqual([]);
    expect(suggestTickers("B")).toEqual([]);
    expect(suggestTickers("BBCA")).toEqual([]);
  });

  it("returns nothing for non-alpha input", () => {
    expect(suggestTickers("B1")).toEqual([]);
    expect(suggestTickers("12")).toEqual([]);
  });

  it("prefix-matches the IDX list, sorted and capped", () => {
    const out = suggestTickers("BBC");
    expect(out).toContain("BBCA");
    expect(out.every((t) => t.startsWith("BBC"))).toBe(true);
    expect(out).toEqual([...out].sort());
  });

  it("respects the limit", () => {
    expect(suggestTickers("B", 3)).toEqual([]); // 1 char -> none
    expect(suggestTickers("BB", 3).length).toBeLessThanOrEqual(3);
  });

  it("is case-insensitive", () => {
    expect(suggestTickers("bbc")).toContain("BBCA");
  });
});

describe("formatTickers", () => {
  const tickers = ["BBCA", "BBRI"];

  it("returns an empty string for no tickers", () => {
    expect(formatTickers([], "tradingview")).toBe("");
  });

  it("prefixes IDX: for the tradingview format", () => {
    expect(formatTickers(tickers, "tradingview")).toBe("IDX:BBCA,IDX:BBRI");
  });

  it("joins with commas for plain format", () => {
    expect(formatTickers(tickers, "plain")).toBe("BBCA,BBRI");
  });

  it("joins with newlines for newline format", () => {
    expect(formatTickers(tickers, "newline")).toBe("BBCA\nBBRI");
  });
});

describe("diffTickers", () => {
  it("reports added, removed, and unchanged tickers", () => {
    const result = diffTickers(["BBCA", "BBRI"], ["BBRI", "TLKM"]);
    expect(result).toEqual({
      added: ["TLKM"],
      removed: ["BBCA"],
      unchanged: ["BBRI"],
    });
  });
});

describe("mergeTickers", () => {
  it("merges lists preserving first-seen order and removing duplicates", () => {
    expect(mergeTickers([["BBCA", "BBRI"], ["BBRI", "TLKM"], ["BBCA"]])).toEqual([
      "BBCA",
      "BBRI",
      "TLKM",
    ]);
  });

  it("returns an empty array when given no lists", () => {
    expect(mergeTickers([])).toEqual([]);
  });
});
