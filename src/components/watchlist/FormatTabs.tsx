import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OutputFormat } from "@/lib/tickers";

export function FormatTabs({
  value,
  onChange,
}: {
  value: OutputFormat;
  onChange: (v: OutputFormat) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
      <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
        <TabsTrigger value="tradingview" className="rounded-lg text-xs sm:text-sm">
          TradingView
        </TabsTrigger>
        <TabsTrigger value="plain" className="rounded-lg text-xs sm:text-sm">
          Plain
        </TabsTrigger>
        <TabsTrigger value="newline" className="rounded-lg text-xs sm:text-sm">
          Newline
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
