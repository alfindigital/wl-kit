import { forwardRef, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export const TickerInput = forwardRef<HTMLTextAreaElement, Props>(
  function TickerInput({ value, onChange }, ref) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

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

    const [hasClipboard, setHasClipboard] = useState(false);
    useEffect(() => {
      setHasClipboard(typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
    }, []);

    return (
      <div className="relative">
        <Textarea
          ref={setRefs}
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Ticker input"
          placeholder="Paste your tickers here... (any format)"
          className="min-h-[96px] resize-none overflow-hidden rounded-2xl border-border/80 bg-card p-4 pr-20 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[140px]"
        />
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
      </div>
    );
  },
);
