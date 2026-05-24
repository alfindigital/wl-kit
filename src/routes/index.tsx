import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { z } from "zod";

import { Footer } from "@/components/watchlist/Footer";
import { TickerInput } from "@/components/watchlist/TickerInput";
import { FormatTabs } from "@/components/watchlist/FormatTabs";
import { OutputBlock } from "@/components/watchlist/OutputBlock";
import { ActionButtons } from "@/components/watchlist/ActionButtons";
import { SaveDialog } from "@/components/watchlist/SaveDialog";
import { SavedWatchlists } from "@/components/watchlist/SavedWatchlists";
import { ShareCard } from "@/components/watchlist/ShareCard";
import { ShareImageDialog } from "@/components/watchlist/ShareImageDialog";
import { InputStats } from "@/components/watchlist/InputStats";
import { CommandPalette } from "@/components/watchlist/CommandPalette";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Index,
  head: () => ({
    meta: [
      { title: "WatchlistKit — Free IDX Watchlist Formatter" },
      {
        name: "description",
        content:
          "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share.",
      },
      { property: "og:url", content: "https://watchlistkit.lovable.app/" },
      { property: "og:title", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      {
        property: "og:description",
        content:
          "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share.",
      },
      { name: "twitter:title", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      {
        name: "twitter:description",
        content:
          "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share.",
      },
    ],
    links: [{ rel: "canonical", href: "https://watchlistkit.lovable.app/" }],
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
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("tradingview");
  const [saved, setSaved] = useState<SavedWatchlist[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadedName, setLoadedName] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shareImageOpen, setShareImageOpen] = useState(false);
  const [shareImageData, setShareImageData] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState("");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSaved(loadWatchlists());
  }, []);

  useEffect(() => {
    if (search.t && typeof search.t === "string") {
      setInput(search.t.replace(/,/g, "\n"));
    }
  }, [search.t]);

  useEffect(() => {
    if (!search.t) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analysis = useMemo(() => analyzeInput(input), [input]);
  const tickers = analysis.valid;
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

  const handleSave = (name: string) => {
    if (saved.length >= MAX_WATCHLISTS) {
      toast.error(`Limit reached (${MAX_WATCHLISTS} watchlists max)`);
      setLiveStatus(`Limit reached: ${MAX_WATCHLISTS} watchlists maximum`);
      return;
    }
    const entry: SavedWatchlist = {
      id: crypto.randomUUID(),
      name,
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
    setLoadedName(name);
    setLiveStatus(`Watchlist "${name}" saved`);
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
    const next = saved.map((w) =>
      w.id === id ? { ...w, name, savedAt: Date.now() } : w,
    );
    setSaved(next);
    saveWatchlists(next);
    setLiveStatus(`Renamed to "${name}"`);
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
    const lists = ids
      .map((id) => saved.find((w) => w.id === id))
      .filter((x): x is SavedWatchlist => !!x)
      .map((w) => w.tickers);
    const merged = mergeTickers(lists);
    const entry: SavedWatchlist = {
      id: crypto.randomUUID(),
      name: `Merged (${ids.length})`,
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

  const handleShare = async () => {
    if (tickers.length === 0) return;
    const url = `${window.location.origin}/?t=${tickers.join(",")}`;
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({
          title: "WatchlistKit",
          text: output,
          url,
        });
        toast.success("Shared");
        return;
      } catch (e) {
        const err = e as DOMException;
        if (err?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed to share");
    }
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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
          <div className="mb-5 text-center sm:mb-6">
            <h1 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">
              Format your IDX watchlist{" "}
              <em className="italic text-primary">in seconds.</em>
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <TickerInput ref={textareaRef} value={input} onChange={setInput} />
            <InputStats
              validCount={tickers.length}
              duplicates={analysis.duplicates}
              invalid={analysis.invalid}
            />
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
            />
            <ActionButtons
              disabled={tickers.length === 0}
              onCopy={() => handleCopy()}
              onSave={handleOpenSave}
              onDownload={handleDownload}
              onImage={handleImage}
              onShare={handleShare}
            />
          </div>

          <div className="mt-10">
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

          <div className="mt-10">
            <ShortcutHint />
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
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveStatus}
      </div>
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
        <Kbd>K</Kbd> palette
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>↵</Kbd> copy
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>S</Kbd> save
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>D</Kbd> download
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>{mod}</Kbd>
        <Kbd>1</Kbd>
        <Kbd>2</Kbd>
        <Kbd>3</Kbd> format
      </span>
    </div>
  );
}
