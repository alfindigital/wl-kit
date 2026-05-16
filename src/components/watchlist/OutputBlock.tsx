import { Badge } from "@/components/ui/badge";

export function OutputBlock({ output, count }: { output: string; count: number }) {
  return (
    <div className="relative rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Output</span>
        <Badge variant="secondary" className="rounded-full text-xs">
          {count} {count === 1 ? "ticker" : "tickers"}
        </Badge>
      </div>
      <pre className="min-h-[80px] max-h-[280px] overflow-auto whitespace-pre-wrap break-all p-4 font-mono text-sm leading-relaxed text-foreground">
        {output || (
          <span className="text-muted-foreground">Your formatted tickers will appear here…</span>
        )}
      </pre>
    </div>
  );
}
