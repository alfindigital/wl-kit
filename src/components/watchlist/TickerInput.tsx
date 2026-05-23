import { forwardRef, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsTouch } from "@/hooks/use-touch";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export const TickerInput = forwardRef<HTMLTextAreaElement, Props>(
  function TickerInput({ value, onChange }, ref) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isTouch = useIsTouch();
    const getTooltipId = (label: string) => `tt-${label.toLowerCase()}`;

    const setRefs = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, 360);
      el.style.height = next + "px";
    }, [value]);

    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        onChange(value ? value + (value.endsWith("\n") ? "" : "\n") + text : text);
        innerRef.current?.focus();
        toast.success("Pasted");
      } catch {
        toast.error("Clipboard access denied");
      }
    };

    const handleClear = () => {
      onChange("");
      innerRef.current?.focus();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const okExt = /\.(txt|csv)$/i.test(file.name);
      const okType = /^text\//.test(file.type) || file.type === "" || file.type === "text/csv";
      if (!okExt || !okType) {
        toast.error("Only .txt or .csv files");
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error("File too large (max 1MB)");
        return;
      }
      try {
        const text = await file.text();
        onChange(value ? value + (value.endsWith("\n") ? "" : "\n") + text : text);
        innerRef.current?.focus();
        toast.success(`Loaded ${file.name}`);
      } catch {
        toast.error("Failed to read file");
      }
    };

    const [hasClipboard, setHasClipboard] = useState(false);
    useEffect(() => {
      setHasClipboard(typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
    }, []);

    const inputHelpId = "ticker-input-help";

    return (
      <div
        className="relative"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setIsDragging(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <span id={inputHelpId} className="sr-only">
          Supports any format: comma, space, tab, semicolon, or newline separated.
          Four-letter IDX ticker codes are recognized automatically.
        </span>
        <Textarea
          ref={setRefs}
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Backspace") {
              e.preventDefault();
              if (!value) return;
              toast("Cleared", { duration: 1200 });
              onChange("");
            }
          }}
          aria-label="Ticker input"
          aria-describedby={inputHelpId}
          placeholder="Paste your tickers here... (any format) — or drop a .txt / .csv file"
          className={`min-h-[120px] resize-none overflow-hidden rounded-2xl border-border/80 bg-card p-4 pr-14 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[160px] ${
            isDragging ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
          }`}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
            Drop file to import
          </div>
        )}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {hasClipboard &&
              (() => {
                const tooltipId = getTooltipId("paste");
                const btn = (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handlePaste}
                    onContextMenu={
                      isTouch
                        ? (e) => {
                            e.preventDefault();
                            toast("Paste", { duration: 1200 });
                          }
                        : undefined
                    }
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Paste"
                    aria-describedby={isTouch ? tooltipId : undefined}
                  >
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                );
                if (isTouch) {
                  return (
                    <div key="paste">
                      {btn}
                      <span id={tooltipId} className="sr-only">Paste</span>
                    </div>
                  );
                }
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="top">Paste</TooltipContent>
                  </Tooltip>
                );
              })()}
            {value &&
              (() => {
                const tooltipId = getTooltipId("clear");
                const btn = (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleClear}
                    onContextMenu={
                      isTouch
                        ? (e) => {
                            e.preventDefault();
                            toast("Clear", { duration: 1200 });
                          }
                        : undefined
                    }
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                    aria-label="Clear"
                    aria-describedby={isTouch ? tooltipId : undefined}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                );
                if (isTouch) {
                  return (
                    <div key="clear">
                      {btn}
                      <span id={tooltipId} className="sr-only">Clear</span>
                    </div>
                  );
                }
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="top">Clear</TooltipContent>
                  </Tooltip>
                );
              })()}
        </div>
      </div>
    );
  },
);
