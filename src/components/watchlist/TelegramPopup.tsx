import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  trackPopupClick,
  trackPopupDismiss,
  trackPopupHover,
  trackPopupImpression,
  type PopupDismissReason,
} from "@/lib/analytics";

const STORAGE_KEY = "wlkit-tg-popup-seen";
const VARIANT_KEY = "wlkit-tg-popup-variant";
const TELEGRAM_URL = "https://t.me/lotmetrik";
const DURATION_MS = 10_000;
const OPEN_DELAY_MS = 1200;

/** Copy variants, so GA4 can show which hook drives the most clicks. */
const VARIANTS = {
  a: {
    title: "Watchlist ideas, daily.",
    body: "Free channel. Setups and tools before anyone else.",
    cta: "Join @lotmetrik",
  },
  b: {
    title: "Don't miss tomorrow's setup.",
    body: "Daily watchlist picks, free on Telegram.",
    cta: "Get free ideas",
  },
  c: {
    title: "Traders get this first.",
    body: "New tools and watchlists drop in the channel.",
    cta: "Join the channel",
  },
} as const;

type VariantKey = keyof typeof VARIANTS;
const VARIANT_KEYS = Object.keys(VARIANTS) as VariantKey[];

function pickVariant(): VariantKey {
  try {
    const stored = localStorage.getItem(VARIANT_KEY);
    if (stored && stored in VARIANTS) return stored as VariantKey;
  } catch {
    /* storage blocked */
  }
  const next = VARIANT_KEYS[Math.floor(Math.random() * VARIANT_KEYS.length)]!;
  try {
    localStorage.setItem(VARIANT_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
}

/**
 * First-visit popup inviting users to the Telegram channel.
 * Centered, dismissible, and auto-hides after 10s with a depleting bar.
 * Emits impression/click/dismiss events so CTR is measurable per variant.
 */
export function TelegramPopup() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const [variant, setVariant] = useState<VariantKey>("a");
  const closeRef = useRef<HTMLButtonElement>(null);
  const openedAtRef = useRef(0);
  const resolvedRef = useRef(false);
  const hoveredRef = useRef(false);
  const copy = useMemo(() => VARIANTS[variant], [variant]);

  const secondsVisible = () =>
    Math.round(((openedAtRef.current ? Date.now() - openedAtRef.current : 0) / 1000) * 10) / 10;

  const close = useCallback(
    (reason: PopupDismissReason) => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        trackPopupDismiss(variant, reason, secondsVisible());
      }
      setOpen(false);
    },
    [variant],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    let delay: number | undefined;
    // Wait until the onboarding tour is finished so the two never overlap.
    const poll = window.setInterval(() => {
      let onboarded = false;
      try {
        onboarded = !!localStorage.getItem("wlkit-onboarded");
      } catch {
        onboarded = true;
      }
      if (!onboarded) return;
      window.clearInterval(poll);
      delay = window.setTimeout(() => {
        setVariant(pickVariant());
        setOpen(true);
      }, OPEN_DELAY_MS);
    }, 500);
    return () => {
      window.clearInterval(poll);
      if (delay) window.clearTimeout(delay);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    closeRef.current?.focus();

    openedAtRef.current = Date.now();
    resolvedRef.current = false;
    trackPopupImpression(variant);

    const start = Date.now();
    const id = window.setInterval(() => {
      const left = DURATION_MS - (Date.now() - start);
      if (left <= 0) {
        window.clearInterval(id);
        close("timeout");
        return;
      }
      setRemaining(left);
    }, 100);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close("escape");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, variant, close]);

  if (!open) return null;

  const pct = Math.max(0, (remaining / DURATION_MS) * 100);
  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => close("backdrop")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in"
        data-variant={variant}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => close("close_button")}
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
            {copy.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{copy.body}</p>

          <Button asChild size="sm" className="mt-4 h-9 w-full rounded-lg text-sm">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={() => {
                if (hoveredRef.current) return;
                hoveredRef.current = true;
                trackPopupHover(variant);
              }}
              onClick={() => {
                resolvedRef.current = true;
                trackPopupClick(variant, secondsVisible(), TELEGRAM_URL);
                setOpen(false);
              }}
            >
              {copy.cta}
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
