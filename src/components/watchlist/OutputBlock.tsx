import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, ArrowUpDown, ArrowDownAZ, ArrowUpAZ, RotateCcw, Check } from "lucide-react";
import type { OutputFormat } from "@/lib/tickers";

export type SortMode = "none" | "asc" | "desc";

export function OutputBlock({
  output,
  count,
  format,
  onCopy,
  sortMode = "none",
  onSortChange,
  duplicates = [],
}: {
  output: string;
  count: number;
  format: OutputFormat;
  onSample?: (tickers: string[]) => void;
  onCopy?: () => void;
  sortMode?: SortMode;
  onSortChange?: (mode: SortMode) => void;
  duplicates?: string[];
}) {
  const lines = output ? output.split("\n") : [];
  const showLineNumbers = format === "newline" && lines.length > 0;
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current && output) {
      liveRef.current.setAttribute("aria-label", `Output updated: ${count} tickers`);
    }
  }, [output, count]);

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="false"
        >
          <span>
            <span className="font-semibold text-foreground">{count}</span>{" "}
            {count === 1 ? "ticker" : "tickers"}
          </span>
          {duplicates.length > 0 && (
            <>
              <span>·</span>
              <span>
                {duplicates.length} duplicate
                {duplicates.length === 1 ? "" : "s"} removed
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSortChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg ${sortMode === "none" ? "text-muted-foreground" : "text-primary"} hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
                  aria-label="Sort tickers"
                  disabled={!output}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 p-1">
                <SortItem
                  active={sortMode === "asc"}
                  onClick={() => onSortChange("asc")}
                  icon={<ArrowDownAZ className="h-3.5 w-3.5" />}
                  label="A → Z"
                />
                <SortItem
                  active={sortMode === "desc"}
                  onClick={() => onSortChange("desc")}
                  icon={<ArrowUpAZ className="h-3.5 w-3.5" />}
                  label="Z → A"
                />
                <SortItem
                  active={sortMode === "none"}
                  onClick={() => onSortChange("none")}
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  label="Original"
                />
              </PopoverContent>
            </Popover>
          )}
          {onCopy && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={onCopy}
              disabled={!output}
              aria-label="Copy output"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div
        ref={liveRef}
        tabIndex={0}
        aria-label="Formatted watchlist output"
        aria-live="polite"
        aria-atomic="true"
        className="max-h-[280px] min-h-[80px] overflow-auto p-4 font-mono text-[15px] leading-relaxed text-foreground outline-none transition-shadow focus-visible:rounded-b-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:text-sm"
      >
        {!output && (
          <p className="font-sans text-sm text-muted-foreground">
            Paste tickers above to see formatted output.
          </p>
        )}
        {output && showLineNumbers && (
          <div className="grid grid-cols-[auto_1fr] gap-x-3">
            {lines.map((line, i) => (
              <div key={i} className="contents">
                <span className="select-none text-right text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="break-all">{line}</span>
              </div>
            ))}
          </div>
        )}
        {output && !showLineNumbers && (
          <pre className="whitespace-pre-wrap break-all font-mono">{output}</pre>
        )}
      </div>
    </div>
  );
}

function SortItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted"
    >
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      {active && <Check className="h-3.5 w-3.5 text-primary" />}
    </button>
  );
}
