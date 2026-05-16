import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { z } from "zod";

import { Header } from "@/components/watchlist/Header";
import { Footer } from "@/components/watchlist/Footer";
import { TickerInput } from "@/components/watchlist/TickerInput";
import { FormatTabs } from "@/components/watchlist/FormatTabs";
import { OutputBlock } from "@/components/watchlist/OutputBlock";
import { ActionButtons } from "@/components/watchlist/ActionButtons";
import { SaveDialog } from "@/components/watchlist/SaveDialog";
import { SavedWatchlists } from "@/components/watchlist/SavedWatchlists";
import { ShareCard } from "@/components/watchlist/ShareCard";

import { formatTickers, parseTickers, type OutputFormat } from "@/lib/tickers";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import {
  loadWatchlists,
  saveWatchlists,
  MAX_WATCHLISTS,
  type SavedWatchlist,
} from "@/lib/storage";

const searchSchema = z.object({
  t: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Index,
  head: () => ({
    meta: [
      { title: "WatchlistKit — IDX Watchlist Formatter" },
      {
        name: "description",
        content:
          "Format your IDX watchlist in seconds. Paste tickers in any format and export to TradingView, plain text, or newline-separated lists.",
      },
      { property: "og:title", content: "WatchlistKit — IDX Watchlist Formatter" },
      {
        property: "og:description",
        content: "Format your IDX watchlist in seconds.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  const search = useSearch({ from: "/" });
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("tradingview");
  const [theme, setTheme] = useState<Theme>("dark");
  const [saved, setSaved] = useState<SavedWatchlist[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadedName, setLoadedName] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const textareaWrapRef = useRef<HTMLDivElement>(null);

  // Theme bootstrap
  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  // Load saved watchlists
  useEffect(() => {
    setSaved(loadWatchlists());
  }, []);

  // Prefill from ?t=
  useEffect(() => {
    if (search.t && typeof search.t === "string") {
      setInput(search.t.replace(/,/g, "\n"));
    }
  }, [search.t]);

  const tickers = useMemo(() => parseTickers(input), [input]);
  const output = useMemo(() => formatTickers(tickers, format), [tickers, format]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (output) {
          navigator.clipboard.writeText(output).then(
            () => toast.success("Copied!"),
            () => {},
          );
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const ta = textareaWrapRef.current?.querySelector("textarea");
        ta?.focus();
        ta?.select();
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (tickers.length > 0) setSaveOpen(true);
        return;
      }
      if (mod && (e.key === "1" || e.key === "2" || e.key === "3")) {
        e.preventDefault();
        const map: Record<string, OutputFormat> = {
          "1": "tradingview",
          "2": "plain",
          "3": "newline",
        };
        handleFormatChange(map[e.key]);
        return;
      }
      if (e.key === "Escape" && inField && target?.tagName === "TEXTAREA") {
        e.preventDefault();
        setInput("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output, tickers.length]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const handleCopy = async (silent = false) => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      if (!silent) toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFormatChange = (f: OutputFormat) => {
    setFormat(f);
    // Auto-copy on format change if there is output
    if (tickers.length > 0) {
      const next = formatTickers(tickers, f);
      navigator.clipboard.writeText(next).then(
        () => toast.success(`Copied as ${labelFor(f)}`),
        () => {},
      );
    }
  };

  const handleSave = (name: string) => {
    if (saved.length >= MAX_WATCHLISTS) {
      toast.error(`Limit reached (${MAX_WATCHLISTS} watchlists max)`);
      return;
    }
    const entry: SavedWatchlist = {
      id: crypto.randomUUID(),
      name,
      tickers,
      savedAt: Date.now(),
    };
    const next = [entry, ...saved];
    setSaved(next);
    saveWatchlists(next);
    setSaveOpen(false);
    setLoadedName(name);
    toast.success("Watchlist saved");
  };

  const handleOpenSave = () => {
    if (saved.length >= MAX_WATCHLISTS) {
      toast.error(`Limit reached (${MAX_WATCHLISTS} watchlists max)`);
      return;
    }
    setSaveOpen(true);
  };

  const handleDelete = (id: string) => {
    const next = saved.filter((w) => w.id !== id);
    setSaved(next);
    saveWatchlists(next);
    toast.success("Deleted");
  };

  const handleLoad = (item: SavedWatchlist) => {
    setInput(item.tickers.join("\n"));
    setLoadedName(item.name);
    toast.success(`Loaded "${item.name}"`);
  };

  const handleShare = async () => {
    if (tickers.length === 0) return;
    const url = `${window.location.origin}/?t=${tickers.join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleImage = async () => {
    if (!shareCardRef.current || tickers.length === 0) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `watchlistkit-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to generate image");
    }
  };

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header theme={theme} onToggle={toggleTheme} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-10 text-center sm:mb-12">
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Format your IDX watchlist
              <br />
              <em className="not-italic text-primary italic">in seconds.</em>
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <div ref={textareaWrapRef}>
              <TickerInput value={input} onChange={setInput} />
            </div>
            <FormatTabs value={format} onChange={handleFormatChange} />
            <OutputBlock output={output} count={tickers.length} />
            <ActionButtons
              disabled={tickers.length === 0}
              onCopy={() => handleCopy()}
              onSave={handleOpenSave}
              onImage={handleImage}
              onShare={handleShare}
            />
            <ShortcutHint />
          </div>

          <div className="mt-10">
            <SavedWatchlists
              items={saved}
              onLoad={handleLoad}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      <Footer />

      <SaveDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSave={handleSave}
        tickerCount={tickers.length}
      />

      {/* Off-screen card for PNG export */}
      <div style={{ position: "fixed", top: -10000, left: -10000, pointerEvents: "none" }}>
        <ShareCard
          ref={shareCardRef}
          name={loadedName || "My Watchlist"}
          output={output}
          count={tickers.length}
          date={dateStr}
        />
      </div>
    </div>
  );
}

function labelFor(f: OutputFormat): string {
  return f === "tradingview" ? "TradingView" : f === "plain" ? "Plain" : "Newline";
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

function ShortcutHint() {
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>↵</Kbd> copy
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd> focus
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>S</Kbd> save
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>1</Kbd>
        <Kbd>2</Kbd>
        <Kbd>3</Kbd> format
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>Esc</Kbd> clear
      </span>
    </div>
  );
}

