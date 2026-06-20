import { describe, expect, it } from "vitest";
import { exportAllTXT, importAllTXT, type SavedWatchlist } from "./storage";

const sample: SavedWatchlist[] = [
  {
    id: "a1",
    name: "Banks",
    tickers: ["BBCA", "BBRI"],
    savedAt: 1000,
    pinned: true,
    lastUsedAt: 2000,
  },
  {
    id: "b2",
    name: "Telco",
    tickers: ["TLKM"],
    savedAt: 3000,
  },
];

describe("exportAllTXT", () => {
  it("emits a header and one section per watchlist", () => {
    const txt = exportAllTXT(sample);
    expect(txt).toContain("# WatchlistKit Export");
    expect(txt).toContain("# version: 1");
    expect(txt).toContain("# total: 2");
    expect(txt).toContain("## Banks");
    expect(txt).toContain("# id: a1");
    expect(txt).toContain("# pinned: true");
    expect(txt).toContain("BBCA, BBRI");
    expect(txt).toContain("## Telco");
    expect(txt).toContain("TLKM");
  });

  it("omits the pinned line for unpinned watchlists", () => {
    const txt = exportAllTXT([sample[1]]);
    expect(txt).not.toContain("# pinned:");
  });
});

describe("importAllTXT", () => {
  it("round-trips an exported file back into equivalent watchlists", () => {
    const txt = exportAllTXT(sample);
    const { merged, added, skipped } = importAllTXT([], txt);

    expect(added).toBe(2);
    expect(skipped).toBe(0);
    expect(merged.map((w) => w.id)).toEqual(["a1", "b2"]);
    expect(merged.map((w) => w.name)).toEqual(["Banks", "Telco"]);
    expect(merged[0].tickers).toEqual(["BBCA", "BBRI"]);
    expect(merged[0].pinned).toBe(true);
    expect(merged[1].pinned).toBe(false);
  });

  it("skips watchlists whose id already exists in the current set", () => {
    const txt = exportAllTXT(sample);
    const current: SavedWatchlist[] = [{ id: "a1", name: "Banks", tickers: ["BBCA"], savedAt: 1 }];
    const { added, skipped } = importAllTXT(current, txt);
    expect(added).toBe(1); // only Telco is new
    expect(skipped).toBe(1); // Banks (a1) is a duplicate
  });

  it("skips sections that contain no tickers", () => {
    const txt = ["## Empty", "# id: z9", "## Real", "# id: r1", "BBCA"].join("\n");
    const { merged, added, skipped } = importAllTXT([], txt);
    expect(added).toBe(1);
    expect(skipped).toBe(1);
    expect(merged[0].name).toBe("Real");
  });

  it("parses ticker lines with mixed comma/space separators and uppercases them", () => {
    const txt = ["## Mixed", "# id: m1", "bbca tlkm,bbri"].join("\n");
    const { merged } = importAllTXT([], txt);
    expect(merged[0].tickers).toEqual(["BBCA", "TLKM", "BBRI"]);
  });

  it("accepts legacy JSON exports", () => {
    const json = JSON.stringify({
      version: 1,
      watchlists: [{ id: "j1", name: "FromJson", tickers: ["BBCA"], savedAt: 5 }],
    });
    const { merged, added } = importAllTXT([], json);
    expect(added).toBe(1);
    expect(merged[0].name).toBe("FromJson");
    expect(merged[0].tickers).toEqual(["BBCA"]);
  });

  it("ignores non-string tickers coming from malformed JSON", () => {
    const json = JSON.stringify([
      { id: "k1", name: "Dirty", tickers: ["BBCA", 42, null, "BBRI"], savedAt: 5 },
    ]);
    const { merged } = importAllTXT([], json);
    expect(merged[0].tickers).toEqual(["BBCA", "BBRI"]);
  });
});
