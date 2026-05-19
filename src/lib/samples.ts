export type Sample = { label: string; tickers: string[] };

export const SAMPLES: Sample[] = [
  { label: "Big banks", tickers: ["BBCA", "BBRI", "BMRI", "BBNI"] },
  {
    label: "LQ45 starter",
    tickers: ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "UNVR", "GOTO", "ICBP"],
  },
  {
    label: "Consumer",
    tickers: ["UNVR", "ICBP", "INDF", "MYOR", "GGRM", "HMSP"],
  },
];
