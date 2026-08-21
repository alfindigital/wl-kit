import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Settings2 } from "lucide-react";

export const EXCHANGE_PREFIX_OPTIONS = [
  { label: "None", value: "" },
  { label: "IDX", value: "IDX:" },
  { label: "Binance", value: "BINANCE:" },
] as const;

export type ExchangePrefix = (typeof EXCHANGE_PREFIX_OPTIONS)[number]["value"];

export function ExchangePrefixSelector({
  value,
  onChange,
  defaultPrefix,
  onDefaultPrefixChange,
}: {
  value: ExchangePrefix;
  onChange: (v: ExchangePrefix) => void;
  defaultPrefix?: ExchangePrefix;
  onDefaultPrefixChange?: (v: ExchangePrefix) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Prefix</span>
      <div className="flex items-center gap-1.5">
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
        {onDefaultPrefixChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Prefix settings"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-1">
              <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                Default prefix on open
              </p>
              {EXCHANGE_PREFIX_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onDefaultPrefixChange(opt.value)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                >
                  <span>{opt.label}</span>
                  {defaultPrefix === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
