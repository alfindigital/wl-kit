import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { InvalidToken } from "@/lib/tickers";

export function InputStats({
  validCount,
  duplicates,
  invalid,
}: {
  validCount: number;
  duplicates: string[];
  invalid: InvalidToken[];
}) {
  const [showInvalid, setShowInvalid] = useState(false);

  if (validCount === 0 && duplicates.length === 0 && invalid.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
        {invalid.length > 0 && (
          <>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowInvalid((v) => !v)}
              className="text-destructive underline-offset-2 hover:underline"
            >
              {invalid.length} invalid
            </button>
          </>
        )}
      </div>
      {showInvalid && invalid.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <TooltipProvider delayDuration={200}>
            {invalid.map((t, i) => (
              <Tooltip key={`${t.token}-${i}`}>
                <TooltipTrigger asChild>
                  <span className="cursor-help rounded-md border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] text-destructive">
                    {t.token}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {t.reason === "length"
                    ? "Must be exactly 4 letters"
                    : t.reason === "chars"
                      ? "Contains invalid characters"
                      : "Not a listed IDX ticker"}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
