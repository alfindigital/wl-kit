import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "id";

// Translation dictionary. `en` is the source of truth; every key must exist in
// both languages (enforced via the Key type below).
const DICT = {
  en: {
    "menu.guide": "How to import to TradingView",
    "menu.faq": "FAQ",
    "menu.shortcuts": "Keyboard shortcuts",
    "lang.label": "Language",
    "hero.title.line1": "Build IDX watchlist,",
    "hero.title.line2": "Instantly.",
    "input.placeholder": "Paste or drop tickers here...",
    "input.suggest": "Did you mean",
    "input.aria": "Ticker input",
    "output.empty": "Paste tickers above to see formatted output.",
    "output.ticker": "ticker",
    "output.tickers": "tickers",
    "output.duplicate": "duplicate",
    "output.duplicates": "duplicates",
    "output.duplicatesRemoved": "removed",
    "action.save": "Save",
    "action.download": "Download",
    "action.image": "Image",
    "action.share": "Share",
    "action.openTradingView": "Open in TradingView",
    "guide.title": "How to Import IDX Watchlists to TradingView",
    "guide.subtitle":
      "Format any IDX ticker list and bulk-import it into TradingView in seconds — no manual typing.",
  },
  id: {
    "menu.guide": "Cara impor ke TradingView",
    "menu.faq": "FAQ",
    "menu.shortcuts": "Pintasan keyboard",
    "lang.label": "Bahasa",
    "hero.title.line1": "Bangun watchlist IDX,",
    "hero.title.line2": "Seketika.",
    "input.placeholder": "Tempel atau jatuhkan ticker di sini...",
    "input.suggest": "Maksud Anda",
    "input.aria": "Input ticker",
    "output.empty": "Tempel ticker di atas untuk melihat hasilnya.",
    "output.ticker": "ticker",
    "output.tickers": "ticker",
    "output.duplicate": "duplikat",
    "output.duplicates": "duplikat",
    "output.duplicatesRemoved": "dihapus",
    "action.save": "Simpan",
    "action.download": "Unduh",
    "action.image": "Gambar",
    "action.share": "Bagikan",
    "action.openTradingView": "Buka di TradingView",
    "guide.title": "Cara Impor Watchlist IDX ke TradingView",
    "guide.subtitle":
      "Format daftar ticker IDX apa pun dan impor massal ke TradingView dalam hitungan detik — tanpa ketik manual.",
  },
} as const;

export type TKey = keyof (typeof DICT)["en"];

type I18nValue = { lang: Lang; setLang: (l: Lang) => void; t: (key: TKey) => string };

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "wlkit-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server and first client render are always "en" so hydration matches; the
  // stored/browser preference is applied right after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "id") {
        setLangState(stored);
      }
      // No auto-switch from navigator.language: keep English as canonical
      // locale so <html lang> and crawler-visible copy stay consistent.
    } catch {
      // storage blocked, stay on default
    }
  }, []);


  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  };

  const t = (key: TKey) => DICT[lang][key] ?? DICT.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
