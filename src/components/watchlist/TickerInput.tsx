import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { haptic } from "@/lib/haptics";
import { analyzeInput, suggestTickers } from "@/lib/tickers";

const CLEAR_THRESHOLD = 20;

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export const TickerInput = forwardRef<HTMLTextAreaElement, Props>(function TickerInput(
  { value, onChange },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const emit = (next: string) => {
    const upper = next.toUpperCase();
    if (upper === next) {
      onChange(next);
      return;
    }
    const el = innerRef.current;
    const selStart = el?.selectionStart ?? null;
    const selEnd = el?.selectionEnd ?? null;
    onChange(upper);
    if (el && selStart !== null && selEnd !== null) {
      requestAnimationFrame(() => {
        try {
          el.setSelectionRange(selStart, selEnd);
        } catch {
          // ignore
        }
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const combined = value ? value + (value.endsWith("\n") ? "" : "\n") + text : text;
      emit(combined);
      innerRef.current?.focus();
      toast.success("Pasted");
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const tryClear = () => {
    if (!value) return;
    const count = analyzeInput(value).valid.length;
    if (count > CLEAR_THRESHOLD) {
      setConfirmOpen(true);
      return;
    }
    doClear();
  };

  const doClear = () => {
    haptic(12);
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
      emit(value ? value + (value.endsWith("\n") ? "" : "\n") + text : text);
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

  // Typeahead: suggest IDX symbols for the token currently being typed at the
  // end of the input (the trailing alphanumeric run).
  const trailing = value.toUpperCase().match(/[A-Z0-9]+$/)?.[0] ?? "";
  const suggestions = useMemo(() => suggestTickers(trailing), [trailing]);

  const completeWith = (ticker: string) => {
    const base = trailing ? value.slice(0, value.length - trailing.length) : value;
    emit(base + ticker + "\n");
    requestAnimationFrame(() => {
      const el = innerRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

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
        Supports any format: comma, space, tab, semicolon, or newline separated. Four-letter IDX
        ticker codes are recognized automatically.
      </span>
      <div
        className={`rounded-2xl border bg-card shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary ${
          isDragging ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border/80"
        }`}
      >
        <Textarea
          ref={setRefs}
          autoFocus
          value={value}
          onChange={(e) => emit(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Backspace") {
              e.preventDefault();
              tryClear();
            }
          }}
          aria-label="Ticker input"
          aria-describedby={inputHelpId}
          placeholder="Paste or drop tickers here..."
          className="min-h-[88px] resize-none overflow-hidden rounded-none border-0 bg-transparent p-4 text-base shadow-none focus-visible:ring-0 sm:min-h-[104px]"
        />
        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-1.5">
          <div className="flex items-center gap-2">
            {hasClipboard && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePaste}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Paste from clipboard"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
              </Button>
            )}
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={tryClear}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Ticker suggestions">
          <span className="text-xs text-muted-foreground">Did you mean</span>
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => completeWith(t)}
              className="rounded-md border border-border/70 bg-card px-2 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
          Drop file to import
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear input?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to remove {analyzeInput(value).valid.length} tickers. You can undo this
              from the toast right after.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                doClear();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
