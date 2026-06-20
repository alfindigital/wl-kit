import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function InputStats({
  validCount,
  duplicates,
}: {
  validCount: number;
  duplicates: string[];
}) {
  if (validCount === 0 && duplicates.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
      aria-live="polite"
      aria-atomic="false"
    >
      <span>
        <span className="font-semibold text-foreground">{validCount}</span>{" "}
        {validCount === 1 ? "ticker" : "tickers"}
      </span>
      {duplicates.length > 0 && (
        <>
          <span>·</span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {duplicates.length} duplicate{duplicates.length === 1 ? "" : "s"} removed
                </span>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-[10px]">
                {duplicates.join(", ")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
