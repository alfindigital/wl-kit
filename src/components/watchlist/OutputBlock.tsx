import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { OutputFormat } from "@/lib/tickers";

export function OutputBlock({
  output,
  count,
  format,
  onCopy,
}: {
  output: string;
  count: number;
  format: OutputFormat;
  onSample?: (tickers: string[]) => void;
  onCopy?: () => void;
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
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Output</span>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full text-xs"
            role="status"
            aria-label={`${count} ${count === 1 ? "ticker" : "tickers"} in output`}
          >
            {count} {count === 1 ? "ticker" : "tickers"}
          </Badge>
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
        className="min-h-[80px] max-h-[280px] overflow-auto p-4 font-mono text-[15px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset focus-visible:rounded-b-2xl transition-shadow sm:text-sm"
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
