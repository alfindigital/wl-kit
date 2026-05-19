import { forwardRef, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const ONBOARDED_KEY = "watchlistkit.onboarded";

export const TickerInput = forwardRef<HTMLTextAreaElement, Props>(
  function TickerInput({ value, onChange }, ref) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showOnboard, setShowOnboard] = useState(false);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    // Auto-grow
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, 360);
      el.style.height = next + "px";
    }, [value]);

    // First-visit onboarding hint
    useEffect(() => {
      if (typeof window === "undefined") return;
      if (!localStorage.getItem(ONBOARDED_KEY)) setShowOnboard(true);
    }, []);

    useEffect(() => {
      if (showOnboard && value) dismissOnboard();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const dismissOnboard = () => {
      setShowOnboard(false);
      try {
        localStorage.setItem(ONBOARDED_KEY, "1");
      } catch {}
    };

    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        onChange(value ? value + (value.endsWith("\n") ? "" : "\n") + text : text);
        innerRef.current?.focus();
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
        <Textarea
          ref={setRefs}
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Ticker input"
          placeholder="Paste your tickers here... (any format) — or drop a .txt / .csv file"
          className={`min-h-[96px] resize-none overflow-hidden rounded-2xl border-border/80 bg-card p-4 pr-20 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[140px] ${
            isDragging ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
          }`}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
            Drop file to import
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleClear}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {hasClipboard && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handlePaste}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
              aria-label="Paste"
              title="Paste"
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showOnboard && !value && (
          <div className="absolute -bottom-2 right-3 translate-y-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground">👋 Paste your tickers here to start</span>
              <button
                type="button"
                onClick={dismissOnboard}
                className="font-medium text-primary hover:underline"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);
