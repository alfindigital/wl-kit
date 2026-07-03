// Curated IDX index presets. Snapshots — not real-time.
// Users tap a chip to instantly seed the input with a known basket.

export type Preset = { id: string; label: string; tickers: string[] };

// LQ45 constituents (Aug 2025 - Jan 2026 period, IDX official).
export const LQ45: string[] = [
  "ACES", "ADMR", "ADRO", "AKRA", "AMMN", "AMRT", "ANTM", "ARTO", "ASII", "BBCA",
  "BBNI", "BBRI", "BBTN", "BMRI", "BRIS", "BRPT", "BUKA", "CPIN", "CTRA", "ESSA",
  "EXCL", "GOTO", "HRUM", "ICBP", "INCO", "INDF", "INKP", "ISAT", "ITMG", "JPFA",
  "JSMR", "KLBF", "MAPI", "MBMA", "MDKA", "MEDC", "MTEL", "PGAS", "PGEO", "PTBA",
  "SIDO", "SMGR", "TLKM", "TOWR", "UNTR", "UNVR",
];

// IDX30 subset.
export const IDX30: string[] = [
  "ADRO", "AMMN", "AMRT", "ANTM", "ASII", "BBCA", "BBNI", "BBRI", "BMRI", "BRIS",
  "BRPT", "CPIN", "GOTO", "ICBP", "INCO", "INDF", "ISAT", "ITMG", "KLBF", "MDKA",
  "MEDC", "MTEL", "PGAS", "PTBA", "SMGR", "TLKM", "TOWR", "UNTR", "UNVR", "TPIA",
];

// State-owned enterprises basket.
export const BUMN20: string[] = [
  "ADHI", "ANTM", "BBNI", "BBRI", "BBTN", "BJTM", "BMRI", "BRIS", "ELSA", "GIAA",
  "INAF", "JSMR", "KAEF", "PGAS", "PGEO", "PTBA", "PTPP", "SMBR", "SMGR", "TLKM",
  "TINS", "WIKA", "WSKT",
];

export const PRESETS: Preset[] = [
  { id: "lq45", label: "LQ45", tickers: LQ45 },
  { id: "idx30", label: "IDX30", tickers: IDX30 },
  { id: "bumn", label: "BUMN20", tickers: BUMN20 },
];
