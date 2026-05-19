import { Badge } from "@/components/ui/badge";
import type { OutputFormat } from "@/lib/tickers";
import { SAMPLES } from "@/lib/samples";

export function OutputBlock({
  output,
  count,
  format,
  onSample,
}: {
  output: string;
  count: number;
  format: OutputFormat;
  onSample?: (tickers: string[]) => void;
}) {
  const lines = output ? output.split("\n") : [];
  const showLineNumbers = format === "newline" && lines.length > 0;

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Output</span>
        <Badge variant="secondary" className="rounded-full text-xs">
          {count} {count === 1 ? "ticker" : "tickers"}
        </Badge>
      </div>
      <div className="min-h-[80px] max-h-[280px] overflow-auto p-4 font-mono text-sm leading-relaxed text-foreground">
        {!output && (
          <div className="space-y-2 font-sans">
            <p className="text-sm text-muted-foreground">Paste tickers above, or try a sample:</p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onSample?.(s.tickers)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
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
