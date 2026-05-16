import { Textarea } from "@/components/ui/textarea";

export function TickerInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste your tickers here... (any format: comma, space, newline, mixed)"
      className="min-h-[160px] resize-y rounded-2xl border-border/80 bg-card p-4 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary"
    />
  );
}
