import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OutputFormat } from "@/lib/tickers";

export function FormatTabs({
  value,
  onChange,
}: {
  value: OutputFormat;
  onChange: (v: OutputFormat) => void;
}) {
  const cls =
    "rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
      <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
        <TabsTrigger value="tradingview" className={cls}>
          TradingView
        </TabsTrigger>
        <TabsTrigger value="plain" className={cls}>
          Plain
        </TabsTrigger>
        <TabsTrigger value="newline" className={cls}>
          Newline
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
