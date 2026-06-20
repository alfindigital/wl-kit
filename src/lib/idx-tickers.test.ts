import { describe, expect, it } from "vitest";
import { IDX_TICKERS } from "./idx-tickers";

describe("IDX_TICKERS data integrity", () => {
  it("is a non-empty set", () => {
    expect(IDX_TICKERS.size).toBeGreaterThan(0);
  });

  it("contains only unique 4-letter uppercase A-Z codes", () => {
    for (const code of IDX_TICKERS) {
      expect(code).toMatch(/^[A-Z]{4}$/);
    }
  });

  it("includes well-known blue-chip symbols", () => {
    for (const code of ["BBCA", "BBRI", "TLKM", "ASII", "UNVR"]) {
      expect(IDX_TICKERS.has(code)).toBe(true);
    }
  });

  it("does not contain lower-cased or whitespace-padded entries", () => {
    for (const code of IDX_TICKERS) {
      expect(code).toBe(code.trim());
      expect(code).toBe(code.toUpperCase());
    }
  });
});
