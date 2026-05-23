import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OutputFormat } from "@/lib/tickers";

export function FormatTabs({
  value,
  onChange,
  onSelect,
}: {
  value: OutputFormat;
  onChange: (v: OutputFormat) => void;
  onSelect?: (v: OutputFormat) => void;
}) {
  const cls =
    "rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none";
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
      <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
        <TabsTrigger value="tradingview" className={cls} onClick={() => onSelect?.("tradingview")}>
          TradingView
        </TabsTrigger>
        <TabsTrigger value="plain" className={cls} onClick={() => onSelect?.("plain")}>
          Plain
        </TabsTrigger>
        <TabsTrigger value="newline" className={cls} onClick={() => onSelect?.("newline")}>
          Newline
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
