import { cn } from "@/lib/utils";

export const EXCHANGE_PREFIX_OPTIONS = [
  { label: "None", value: "" },
  { label: "IDX", value: "IDX:" },
  { label: "Binance", value: "BINANCE:" },
] as const;

export type ExchangePrefix = (typeof EXCHANGE_PREFIX_OPTIONS)[number]["value"];

export function ExchangePrefixSelector({
  value,
  onChange,
}: {
  value: ExchangePrefix;
  onChange: (v: ExchangePrefix) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Prefix</span>
      <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted p-0.5">
        {EXCHANGE_PREFIX_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium transition-all",
                active
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
