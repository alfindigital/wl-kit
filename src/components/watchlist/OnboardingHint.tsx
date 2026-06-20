import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  step: number;
  total?: number;
  title: string;
  body?: string;
  onDismiss: () => void;
  tone?: "primary" | "accent";
};

export function OnboardingHint({
  step,
  total = 3,
  title,
  body,
  onDismiss,
  tone = "primary",
}: Props) {
  const isFirst = step === 1;
  const toneClasses =
    tone === "accent" ? "border-accent/40 bg-accent/10" : "border-primary/30 bg-primary/5";

  return (
    <div
      role="note"
      aria-label={`Onboarding step ${step} of ${total}`}
      className={`relative flex items-start gap-3 rounded-2xl border ${toneClasses} px-3 py-2.5 text-sm shadow-sm animate-in fade-in slide-in-from-top-1`}
    >
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {step}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        {body && <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{body}</p>}
      </div>
      {isFirst && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="-mr-1 h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Dismiss onboarding hints"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
