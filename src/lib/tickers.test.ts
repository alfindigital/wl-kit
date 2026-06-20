import { describe, expect, it } from "vitest";
import { analyzeInput, parseTickers, formatTickers, diffTickers, mergeTickers } from "./tickers";

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
