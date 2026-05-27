import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type TourStep = {
  ref: RefObject<HTMLElement | null>;
  title: string;
  body: string;
  placement?: "top" | "bottom";
};

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;
const TOOLTIP_W = 320;
const TOOLTIP_GAP = 14;

export function OnboardingTour({
  steps,
  open,
  onClose,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  const step = steps[i];

  useLayoutEffect(() => {
    if (!open || !step) return;
    const compute = () => {
      const el = step.ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const el = step.ref.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = setTimeout(compute, 350);
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, step]);

  if (!mounted || !open || !step) return null;

  const last = i === steps.length - 1;

  // Tooltip placement
  let tipTop = 0;
  let tipLeft = 0;
  let placement: "top" | "bottom" = step.placement ?? "bottom";
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!step.placement) {
      placement = rect.top + rect.height + TOOLTIP_GAP + 180 > vh ? "top" : "bottom";
    }
    tipLeft = Math.min(
      Math.max(8, rect.left + rect.width / 2 - TOOLTIP_W / 2),
      vw - TOOLTIP_W - 8,
    );
    tipTop =
      placement === "bottom"
        ? rect.top + rect.height + TOOLTIP_GAP
        : rect.top - TOOLTIP_GAP - 8; // adjusted via transform
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Onboarding ${i + 1} of ${steps.length}: ${step.title}`}
      className="fixed inset-0 z-[60]"
    >
      {/* Spotlight backdrop */}
      {rect ? (
        <div
          className="pointer-events-auto absolute rounded-2xl transition-all duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            outline: "2px solid hsl(var(--primary, 24 95% 53%))",
            outlineOffset: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Tooltip */}
      {rect && (
        <div
          className="pointer-events-auto absolute"
          style={{
            top: tipTop,
            left: tipLeft,
            width: TOOLTIP_W,
            transform: placement === "top" ? "translateY(-100%)" : undefined,
          }}
        >
          {/* Arrow */}
          <div
            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-border bg-card"
            style={
              placement === "bottom"
                ? { top: -6, borderRight: "none", borderBottom: "none" }
                : { bottom: -6, borderLeft: "none", borderTop: "none" }
            }
          />
          <div className="relative rounded-2xl border border-border bg-card p-4 shadow-xl">
            <button
              type="button"
              onClick={onClose}
              aria-label="Skip onboarding"
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {i + 1} of {steps.length}
              </span>
            </div>
            <h3 className="mt-2 pr-6 text-sm font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setI((v) => v - 1)}
                    className="h-8 text-xs"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => (last ? onClose() : setI((v) => v + 1))}
                  className="h-8 text-xs"
                >
                  {last ? "Got it" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
