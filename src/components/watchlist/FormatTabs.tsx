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
    "relative h-11 sm:h-10 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:after:absolute data-[state=active]:after:bottom-1 data-[state=active]:after:left-1/2 data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:h-0.5 data-[state=active]:after:w-6 data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none";
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted p-1">
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
