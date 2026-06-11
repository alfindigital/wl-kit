import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { z } from "zod";
import ogImage from "@/assets/og-image.jpg";

import { Footer } from "@/components/watchlist/Footer";
import { FaqDialog, FAQ_ITEMS } from "@/components/watchlist/Faq";
import { TickerInput } from "@/components/watchlist/TickerInput";
import { FormatTabs } from "@/components/watchlist/FormatTabs";
import { OutputBlock, type SortMode } from "@/components/watchlist/OutputBlock";
import { ActionButtons } from "@/components/watchlist/ActionButtons";
import { SaveDialog } from "@/components/watchlist/SaveDialog";
import { SavedWatchlists } from "@/components/watchlist/SavedWatchlists";
import { ShareCard } from "@/components/watchlist/ShareCard";
import { ShareImageDialog } from "@/components/watchlist/ShareImageDialog";
import { ShareLinkDialog } from "@/components/watchlist/ShareLinkDialog";
import { InputStats } from "@/components/watchlist/InputStats";
import { CommandPalette } from "@/components/watchlist/CommandPalette";
import { ThemeToggle } from "@/components/watchlist/ThemeToggle";
import { OnboardingTour, type TourStep } from "@/components/watchlist/OnboardingTour";
import { ShortcutOverlay } from "@/components/watchlist/ShortcutOverlay";
import { ScrollToInputFab } from "@/components/watchlist/ScrollToInputFab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircleQuestion, Keyboard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function HelpMenu({
  onFaq,
  onShortcuts,
}: {
  onFaq: () => void;
  onShortcuts: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl p-1.5"
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onFaq();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <MessageCircleQuestion className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">FAQ</span>
          <kbd className="font-mono text-[10px] text-muted-foreground">?</kbd>
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onShortcuts();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Keyboard shortcuts</span>
          <kbd className="font-mono text-[10px] text-muted-foreground">⇧?</kbd>
        </button>
      </PopoverContent>
    </Popover>
  );
}

import {
  analyzeInput,
  formatTickers,
  diffTickers,
  mergeTickers,
  type OutputFormat,
} from "@/lib/tickers";
import {
  loadWatchlists,
  saveWatchlists,
  exportAllJSON,
  importAllJSON,
  MAX_WATCHLISTS,
  type SavedWatchlist,
} from "@/lib/storage";

const searchSchema = z.object({
  t: z.string().optional(),
  f: z.enum(["tradingview", "plain", "newline"]).optional(),
  s: z.enum(["none", "asc", "desc"]).optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Index,
  head: () => ({
    meta: [
      { title: "WatchlistKit — Free IDX Stock Watchlist Formatter" },
      {
        name: "description",
        content:
          "Format your IDX stock watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      { property: "og:url", content: "https://wlkit.lovable.app/" },
      { property: "og:title", content: "WatchlistKit — Free IDX Stock Watchlist Formatter" },
      {
        property: "og:description",
        content:
          "Format your IDX stock watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "WatchlistKit — Free IDX Stock Watchlist Formatter" },
      {
        name: "twitter:description",
        content:
          "Format your IDX stock watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      { name: "twitter:image", content: `https://wlkit.lovable.app${ogImage}` },
      { name: "twitter:image:alt", content: "WatchlistKit — Free IDX Stock Watchlist Formatter" },
    ],
    links: [{ rel: "canonical", href: "https://wlkit.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: "en-US",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
});

type DiffData = {
  a: SavedWatchlist;
  b: SavedWatchlist;
  added: string[];
  removed: string[];
  unchanged: string[];
};

function Index() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("tradingview");
  const [saved, setSaved] = useState<SavedWatchlist[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadedName, setLoadedName] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shareImageOpen, setShareImageOpen] = useState(false);
  const [shareImageData, setShareImageData] = useState<string | null>(null);
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
  const [shareLinkUrl, setShareLinkUrl] = useState("");
  const [liveStatus, setLiveStatus] = useState("");
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("none");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem("wlkit-onboarded");
    if (!done) setOnboardingActive(true);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("wlkit-onboarded", "1");
    setOnboardingActive(false);
  };
  const reopenOnboarding = () => {
    localStorage.removeItem("wlkit-onboarded");
    setOnboardingActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const shareCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputStepRef = useRef<HTMLDivElement>(null);
  const formatStepRef = useRef<HTMLDivElement>(null);
  const actionStepRef = useRef<HTMLDivElement>(null);
  const savedStepRef = useRef<HTMLDivElement>(null);
  const helpStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(loadWatchlists());
  }, []);

  // Restore last session (input/format/sort) from localStorage on mount.
  // URL params (?t=…) take precedence and are handled in the effect below.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (search.t) return;
    try {
      const raw = localStorage.getItem("wlkit.session");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data?.input === "string") setInput(data.input);
      if (["tradingview", "plain", "newline"].includes(data?.format)) setFormat(data.format);
      if (["none", "asc", "desc"].includes(data?.sortMode)) setSortMode(data.sortMode);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist session to localStorage whenever it changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "wlkit.session",
        JSON.stringify({ input, format, sortMode }),
      );
    } catch {
      // ignore quota errors
    }
  }, [input, format, sortMode]);

  useEffect(() => {
    if (search.t && typeof search.t === "string") {
      setInput(search.t.replace(/,/g, "\n"));
    }
    if (search.f && ["tradingview", "plain", "newline"].includes(search.f)) {
      setFormat(search.f);
    }
    if (search.s && ["none", "asc", "desc"].includes(search.s)) {
      setSortMode(search.s);
    }
  }, [search.t, search.f, search.s]);

  useEffect(() => {
    if (!search.t) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const analysis = useMemo(() => analyzeInput(input), [input]);
  const tickers = useMemo(() => {
    const base = analysis.valid;
    if (sortMode === "asc") return [...base].sort();
    if (sortMode === "desc") return [...base].sort().reverse();
    return base;
  }, [analysis.valid, sortMode]);
  const output = useMemo(() => formatTickers(tickers, format), [tickers, format]);

  // Undo helper
  const updateSaved = (
    next: SavedWatchlist[],
    undoSnapshot: SavedWatchlist[],
    message: string,
  ) => {
    setSaved(next);
    saveWatchlists(next);
    setLiveStatus(message);
    toast(message, {
      action: {
        label: "Undo",
        onClick: () => {
          setSaved(undoSnapshot);
          saveWatchlists(undoSnapshot);
        },
      },
      duration: 5000,
    });
  };

  const handleCopy = async (silent = false) => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      if (!silent) {
        toast.success("Copied!");
        setLiveStatus("Copied to clipboard");
      }
    } catch {
      toast.error("Failed to copy");
      setLiveStatus("Failed to copy");
    }
  };

  const handleFormatChange = (f: OutputFormat) => {
    if (f === format) return;
    setFormat(f);
    navigate({ search: (prev: any) => ({ ...prev, f }) });
    if (tickers.length > 0) {
      const next = formatTickers(tickers, f);
      if (next === output) return;
      navigator.clipboard.writeText(next).then(
        () => {
          toast.success(`Copied as ${labelFor(f)}`);
          setLiveStatus(`Copied as ${labelFor(f)}`);
        },
        () => {},
      );
    }
  };

  const handleSortChange = (s: SortMode) => {
    if (s === sortMode) return;
    setSortMode(s);
    navigate({ search: (prev: any) => ({ ...prev, s }) });
  };

  const handleSave = (name: string) => {
    if (saved.length >= MAX_WATCHLISTS) {
      toast.error(`Limit reached (${MAX_WATCHLISTS} watchlists max)`);
      setLiveStatus(`Limit reached: ${MAX_WATCHLISTS} watchlists maximum`);
      return;
    }
    const trimmed = name.trim();
    const dup = saved.some(
      (w) => w.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (dup) {
      toast.error(`A watchlist named "${trimmed}" already exists`);
      setLiveStatus(`Save failed: "${trimmed}" already exists`);
      return;
    }
    const entry: SavedWatchlist = {
      id: crypto.randomUUID(),
      name: trimmed,
      tickers,
      savedAt: Date.now(),
      pinned: false,
      tags: [],
      lastUsedAt: Date.now(),
    };
    const next = [entry, ...saved];
    setSaved(next);
    saveWatchlists(next);
    setSaveOpen(false);
    setLoadedName(trimmed);
    setLiveStatus(`Watchlist "${trimmed}" saved`);
    toast.success("Watchlist saved");
  };

  const handleOpenSave = () => {
    if (tickers.length === 0) return;
    if (saved.length >= MAX_WATCHLISTS) {
      toast.error(`Limit reached (${MAX_WATCHLISTS} watchlists max)`);
      return;
    }
    setSaveOpen(true);
  };

  const handleDelete = (id: string) => {
    const snapshot = saved;
    const next = saved.filter((w) => w.id !== id);
    updateSaved(next, snapshot, "Deleted");
  };

  const handleRename = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    const dup = saved.some(
      (w) => w.id !== id && w.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (dup) {
      toast.error(`A watchlist named "${trimmed}" already exists`);
      setLiveStatus(`Rename failed: "${trimmed}" already exists`);
      return;
    }
    const next = saved.map((w) =>
      w.id === id ? { ...w, name: trimmed, savedAt: Date.now() } : w,
    );
    setSaved(next);
    saveWatchlists(next);
    setLiveStatus(`Renamed to "${trimmed}"`);
    toast.success("Renamed");
  };

  const handleTogglePin = (id: string) => {
    const item = saved.find((w) => w.id === id);
    const next = saved.map((w) =>
      w.id === id ? { ...w, pinned: !w.pinned } : w,
    );
    setSaved(next);
    saveWatchlists(next);
    if (item) {
      setLiveStatus(`${item.pinned ? "Unpinned" : "Pinned"} "${item.name}"`);
    }
  };

  const handleSetTags = (id: string, tags: string[]) => {
    const next = saved.map((w) => (w.id === id ? { ...w, tags } : w));
    setSaved(next);
    saveWatchlists(next);
    setLiveStatus("Tags updated");
    toast.success("Tags updated");
  };

  const handleExport = () => {
    const json = exportAllJSON(saved);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watchlistkit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const msg = `Exported ${saved.length} watchlist${saved.length === 1 ? "" : "s"}`;
    setLiveStatus(msg);
    toast.success(msg);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const snapshot = saved;
      const { merged, added, skipped } = importAllJSON(saved, text);
      setSaved(merged);
      saveWatchlists(merged);
      const msg = `Imported ${added}${skipped ? `, skipped ${skipped}` : ""}`;
      setLiveStatus(msg);
      toast(msg, {
        action: {
          label: "Undo",
          onClick: () => {
            setSaved(snapshot);
            saveWatchlists(snapshot);
          },
        },
        duration: 5000,
      });
    } catch {
      setLiveStatus("Invalid JSON file");
      toast.error("Invalid JSON file");
    }
  };

  const handleMerge = (ids: string[]) => {
    const sources = ids
      .map((id) => saved.find((w) => w.id === id))
      .filter((x): x is SavedWatchlist => !!x);
    const lists = sources.map((w) => w.tickers);
    const merged = mergeTickers(lists);
    const mergedName =
      sources.map((w) => w.name).join(" + ") || `Merged (${ids.length})`;
    const entry: SavedWatchlist = {
      id: crypto.randomUUID(),
      name: mergedName,
      tickers: merged,
      savedAt: Date.now(),
      pinned: false,
      tags: [],
      lastUsedAt: Date.now(),
    };
    const next = [entry, ...saved];
    setSaved(next);
    saveWatchlists(next);
    const msg = `Merged ${merged.length} unique tickers`;
    setLiveStatus(msg);
    toast.success(msg);
  };

  const handleCompare = (idA: string, idB: string) => {
    const a = saved.find((w) => w.id === idA);
    const b = saved.find((w) => w.id === idB);
    if (!a || !b) return;
    const d = diffTickers(a.tickers, b.tickers);
    setDiff({ a, b, ...d });
  };

  const handleLoad = (item: SavedWatchlist) => {
    setInput(item.tickers.join("\n"));
    setLoadedName(item.name);
    const next = saved.map((w) =>
      w.id === item.id ? { ...w, lastUsedAt: Date.now() } : w,
    );
    setSaved(next);
    saveWatchlists(next);
    setLiveStatus(`Loaded "${item.name}"`);
    toast.success(`Loaded "${item.name}"`);
  };

  const handleSample = (sample: string[]) => {
    setInput(sample.join("\n"));
    textareaRef.current?.focus();
  };

  const handleClearInput = () => {
    if (!input) return;
    const snapshot = input;
    setInput("");
    toast("Cleared", {
      action: { label: "Undo", onClick: () => setInput(snapshot) },
      duration: 5000,
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(loadedName || "watchlistkit").replace(/[^a-z0-9-_]+/gi, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .txt");
  };

  const buildShareUrl = () => {
    const params = new URLSearchParams();
    params.set("t", tickers.join(","));
    if (format !== "tradingview") params.set("f", format);
    if (sortMode !== "none") params.set("s", sortMode);
    return `${window.location.origin}/?${params.toString()}`;
  };

  const handleShare = async () => {
    if (tickers.length === 0) {
      toast.error("Nothing to share — add tickers first");
      return;
    }
    const url = buildShareUrl();
    setShareLinkUrl(url);
    setShareLinkOpen(true);
  };


  const handleImage = async () => {
    if (!shareCardRef.current || tickers.length === 0) return;
    setShareImageData(null);
    setShareImageOpen(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      setShareImageData(dataUrl);
      toast.success("Image ready");
    } catch {
      setShareImageOpen(false);
      toast.error("Failed to generate image");
    }
  };


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
        handleCopy();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleSortChange("asc");
        setLiveStatus("Sorted A → Z");
        toast.success("Sorted A → Z");
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleSortChange("desc");
        setLiveStatus("Sorted Z → A");
        toast.success("Sorted Z → A");
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleSortChange("none");
        setLiveStatus("Original order");
        toast.success("Original order");
        return;
      }
      if (mod && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        textareaRef.current?.focus();
        textareaRef.current?.select();
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleOpenSave();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDownload();
        return;
      }
      if (mod && !inField && e.key.toLowerCase() === "v") {
        textareaRef.current?.focus();
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
      if (e.key === "?" && !inField && !mod) {
        e.preventDefault();
        setShortcutOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output, tickers.length, saved.length, input]);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Mobile sticky compact header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 pt-safe backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2">
          <span className="font-display text-base italic text-primary">WatchlistKit</span>
          <div className="flex items-center gap-1">
            {tickers.length > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full text-[11px]"
                role="status"
                aria-label={`${tickers.length} valid tickers`}
              >
                {tickers.length} {tickers.length === 1 ? "ticker" : "tickers"}
              </Badge>
            )}
            <ThemeToggle />
            <HelpMenu
              onFaq={() => setFaqOpen(true)}
              onShortcuts={() => setShortcutOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Desktop floating controls */}
      <div className="pointer-events-none fixed right-4 top-4 z-30 hidden items-center gap-1 sm:flex">
        <div
          ref={helpStepRef}
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/60 bg-card/80 px-1 py-1 shadow-sm backdrop-blur"
        >
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setFaqOpen(true)}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
            aria-label="FAQ"
          >
            <MessageCircleQuestion className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShortcutOpen(true)}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <main className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))] sm:pb-0">
        <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
          <div className="mb-4 text-center sm:mb-6">
            <h1 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">
              Build your IDX watchlist, <em className="italic text-primary">instantly.</em>
            </h1>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            <div ref={inputStepRef}>
              <TickerInput
                ref={textareaRef}
                value={input}
                onChange={setInput}
              />
            </div>
            <InputStats
              validCount={tickers.length}
              duplicates={analysis.duplicates}
            />
            <div ref={formatStepRef} className="flex flex-col gap-4 sm:gap-5">
              <FormatTabs
                value={format}
                onChange={handleFormatChange}
                onSelect={(f) => {
                  if (f === "tradingview" && f === format && tickers.length > 0) {
                    navigator.clipboard.writeText(formatTickers(tickers, f)).then(
                      () => {
                        toast.success("Copied as TradingView");
                        setLiveStatus("Copied as TradingView");
                      },
                      () => {},
                    );
                  }
                }}
              />
              <OutputBlock
                output={output}
                count={tickers.length}
                format={format}
                onSample={handleSample}
                onCopy={() => handleCopy()}
                sortMode={sortMode}
                onSortChange={handleSortChange}
              />
            </div>
            <div ref={actionStepRef}>
              <ActionButtons
                disabled={tickers.length === 0}
                onCopy={() => handleCopy()}
                onSave={handleOpenSave}
                onDownload={handleDownload}
                onImage={handleImage}
                onShare={handleShare}
              />
            </div>
          </div>

          <div ref={savedStepRef} className="mt-10">
            <SavedWatchlists
              items={saved}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onRename={handleRename}
              onMerge={handleMerge}
              onCompare={handleCompare}
              onTogglePin={handleTogglePin}
              onSetTags={handleSetTags}
              onExport={handleExport}
              onImport={handleImport}
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
        existingNames={saved.map((w) => w.name)}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        saved={saved}
        onCopy={() => handleCopy()}
        onDownload={handleDownload}
        onSave={handleOpenSave}
        onShare={handleShare}
        onClear={handleClearInput}
        onSetFormat={handleFormatChange}
        onLoad={handleLoad}
      />

      <Dialog open={!!diff} onOpenChange={(o) => !o && setDiff(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Compare watchlists</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{diff?.a.name}</span> →{" "}
              <span className="font-medium">{diff?.b.name}</span>
            </DialogDescription>
          </DialogHeader>
          {diff && (
            <div className="space-y-4 text-sm">
              <DiffSection label="Added" tone="added" items={diff.added} />
              <DiffSection label="Removed" tone="removed" items={diff.removed} />
              <DiffSection label="Unchanged" tone="muted" items={diff.unchanged} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div style={{ position: "fixed", top: -10000, left: -10000, pointerEvents: "none" }}>
        <ShareCard
          ref={shareCardRef}
          name={loadedName || "My Watchlist"}
          output={output}
          count={tickers.length}
          date={dateStr}
        />
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveStatus}
      </div>

      <ShareImageDialog
        open={shareImageOpen}
        onOpenChange={setShareImageOpen}
        dataUrl={shareImageData}
        name={loadedName || "My Watchlist"}
        shareText={`${tickers.length} IDX tickers · made with WatchlistKit`}
        shareUrl={
          tickers.length
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/?t=${tickers.join(",")}`
            : typeof window !== "undefined"
              ? window.location.origin
              : ""
        }
      />

      <ShareLinkDialog
        open={shareLinkOpen}
        onOpenChange={setShareLinkOpen}
        url={shareLinkUrl}
        tickerCount={tickers.length}
      />

      <ScrollToInputFab targetRef={textareaRef} />
      <FaqDialog open={faqOpen} onOpenChange={setFaqOpen} />
      <ShortcutOverlay
        open={shortcutOpen}
        onOpenChange={setShortcutOpen}
        onShowOnboarding={reopenOnboarding}
      />
      <OnboardingTour
        open={onboardingActive}
        onClose={dismissOnboarding}
        steps={[
          {
            ref: inputStepRef,
            title: "Paste your tickers here",
            body: "Any format works: comma, space, newline — or drop a .txt / .csv file.",
          },
          {
            ref: formatStepRef,
            title: "Pick a format & preview the output",
            body: "Switch between TradingView, Plain, or Newline. Tap the active tab to copy instantly.",
          },
          {
            ref: actionStepRef,
            title: "Copy, save, or share",
            body: "Use the action bar to copy, save the watchlist, download .txt, or share a link/image.",
            placement: "top",
          },
          {
            ref: savedStepRef,
            title: "Your saved watchlists live here",
            body: "Tap any watchlist to load it back into the input. Long-press or use the menu to delete. You can save up to 20 watchlists — a warning appears when you're close to the limit.",
            placement: "top",
          },
          {
            ref: helpStepRef,
            title: "Need a hand? Open shortcuts anytime",
            body: "Press ? or tap this button to see every keyboard shortcut and replay this tour.",
          },
        ]}
      />
    </div>
  );
}


function DiffSection({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "added" | "removed" | "muted";
  items: string[];
}) {
  const toneClass =
    tone === "added"
      ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
      : tone === "removed"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-border bg-muted text-muted-foreground";
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {items.length}
        </Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((t) => (
            <span
              key={t}
              className={`rounded-md border px-2 py-0.5 font-mono text-xs ${toneClass}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(f: OutputFormat): string {
  return f === "tradingview" ? "TradingView" : f === "plain" ? "Plain" : "Newline";
}

