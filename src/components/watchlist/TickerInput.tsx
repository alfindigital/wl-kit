import { forwardRef, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste, Sparkles, CaseSensitive } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SAMPLES } from "@/lib/samples";
import { haptic } from "@/lib/haptics";
import { analyzeInput } from "@/lib/tickers";

const UPPERCASE_KEY = "wlkit-auto-uppercase";
const CLEAR_THRESHOLD = 20;

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSample?: (tickers: string[]) => void;
};

export const TickerInput = forwardRef<HTMLTextAreaElement, Props>(
  function TickerInput({ value, onChange, onSample }, ref) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [autoUpper, setAutoUpper] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
      const stored = localStorage.getItem(UPPERCASE_KEY);
      if (stored !== null) setAutoUpper(stored === "1");
    }, []);

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
      if (!autoUpper) {
        onChange(next);
        return;
      }
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

    const toggleUpper = () => {
      const next = !autoUpper;
      setAutoUpper(next);
      localStorage.setItem(UPPERCASE_KEY, next ? "1" : "0");
      toast(next ? "Auto-UPPERCASE on" : "Auto-UPPERCASE off", { duration: 1500 });
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
          onChange={(e) => emit(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Backspace") {
              e.preventDefault();
              tryClear();
            }
          }}
          aria-label="Ticker input"
          aria-describedby={inputHelpId}
          placeholder="Paste your tickers here... (any format) — or drop a .txt / .csv file"
          className={`min-h-[120px] resize-none overflow-hidden rounded-2xl rounded-b-none border-b-0 border-border/80 bg-card p-4 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[160px] ${
            isDragging ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
          }`}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
            Drop file to import
          </div>
        )}
        <div className="flex items-center justify-between gap-2 rounded-b-2xl border border-border/80 border-t-border/40 bg-card px-2 py-1.5 shadow-sm">
          <div className="flex items-center gap-1">
            {hasClipboard && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handlePaste}
                className="h-9 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Paste from clipboard"
              >
                <ClipboardPaste className="h-4 w-4" />
                <span>Paste</span>
              </Button>
            )}
            {onSample && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Insert sample tickers"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Sample</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SAMPLES.map((s) => (
                    <DropdownMenuItem
                      key={s.label}
                      onClick={() => onSample(s.tickers)}
                      className="text-xs"
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="ml-2 text-muted-foreground">
                        ({s.tickers.length})
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={toggleUpper}
              aria-pressed={autoUpper}
              aria-label={`Auto uppercase ${autoUpper ? "on" : "off"}`}
              title={`Auto-UPPERCASE: ${autoUpper ? "on" : "off"}`}
              className={`h-9 gap-1.5 rounded-lg px-2.5 text-xs focus-visible:ring-2 focus-visible:ring-primary ${
                autoUpper
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <CaseSensitive className="h-4 w-4" />
              <span className="hidden sm:inline">{autoUpper ? "AA" : "Aa"}</span>
            </Button>
          </div>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={tryClear}
              className="h-9 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear input?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan menghapus {analyzeInput(value).valid.length} ticker.
                Tindakan ini bisa di-undo lewat toast setelahnya.
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
  },
);
