import { useEffect, useRef, useState } from "react";
import { X, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wlkit-tg-popup-seen";
const TELEGRAM_URL = "https://t.me/lotmetrik";
const DURATION_MS = 10_000;
const OPEN_DELAY_MS = 1200;

/**
 * First-visit popup inviting users to the Telegram channel.
 * Centered, dismissible, and auto-hides after 10s with a depleting bar.
 */
export function TelegramPopup() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    closeRef.current?.focus();

    const start = Date.now();
    const id = window.setInterval(() => {
      const left = DURATION_MS - (Date.now() - start);
      if (left <= 0) {
        window.clearInterval(id);
        setOpen(false);
        return;
      }
      setRemaining(left);
    }, 100);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const pct = Math.max(0, (remaining / DURATION_MS) * 100);
  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 pb-5 pt-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <h2 id="tg-popup-title" className="mt-3 text-base font-semibold tracking-tight">
            Watchlist ideas, daily.
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Free channel. Setups and tools before anyone else.
          </p>

          <Button asChild size="sm" className="mt-4 h-9 w-full rounded-lg text-sm">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
              Join @lotmetrik
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>

          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            closing in {secondsLeft}s
          </p>
        </div>

        <div className="h-1 w-full bg-border/60" aria-hidden="true">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
