import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Copy,
  Download,
  Save,
  Share2,
  Eraser,
  ListOrdered,
  Hash,
  AlignLeft,
  Bookmark,
} from "lucide-react";
import type { SavedWatchlist } from "@/lib/storage";
import type { OutputFormat } from "@/lib/tickers";

export function CommandPalette({
  open,
  onOpenChange,
  saved,
  onCopy,
  onDownload,
  onSave,
  onShare,
  onClear,
  onSetFormat,
  onLoad,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  saved: SavedWatchlist[];
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onShare: () => void;
  onClear: () => void;
  onSetFormat: (f: OutputFormat) => void;
  onLoad: (w: SavedWatchlist) => void;
}) {
  useEffect(() => {
    if (open) {
      // ensure dialog focus, nothing else
    }
  }, [open]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    setTimeout(fn, 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onCopy)}>
            <Copy className="mr-2 h-4 w-4" /> Copy output
          </CommandItem>
          <CommandItem onSelect={() => run(onDownload)}>
            <Download className="mr-2 h-4 w-4" /> Download .txt
          </CommandItem>
          <CommandItem onSelect={() => run(onSave)}>
            <Save className="mr-2 h-4 w-4" /> Save watchlist
          </CommandItem>
          <CommandItem onSelect={() => run(onShare)}>
            <Share2 className="mr-2 h-4 w-4" /> Share link
          </CommandItem>
          <CommandItem onSelect={() => run(onClear)}>
            <Eraser className="mr-2 h-4 w-4" /> Clear input
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Format">
          <CommandItem onSelect={() => run(() => onSetFormat("tradingview"))}>
            <Hash className="mr-2 h-4 w-4" /> TradingView
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSetFormat("plain"))}>
            <AlignLeft className="mr-2 h-4 w-4" /> Plain (comma-separated)
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSetFormat("newline"))}>
            <ListOrdered className="mr-2 h-4 w-4" /> Newline (one per line)
          </CommandItem>
        </CommandGroup>
        {saved.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Saved Watchlists">
              {saved.map((w) => (
                <CommandItem
                  key={w.id}
                  value={`${w.name} ${w.tickers.join(" ")}`}
                  onSelect={() => run(() => onLoad(w))}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{w.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{w.tickers.length}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
