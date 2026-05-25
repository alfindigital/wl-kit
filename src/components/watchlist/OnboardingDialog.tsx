import { useEffect, useState } from "react";
import { ClipboardPaste, ListChecks, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wlkit-onboarded";

const SLIDES = [
  {
    icon: ClipboardPaste,
    title: "Paste apa saja",
    body:
      "Tempel ticker dengan format bebas — koma, spasi, baris baru. Kami otomatis mengenali kode IDX 4-huruf.",
  },
  {
    icon: ListChecks,
    title: "Pilih format & copy",
    body:
      "Switch antara TradingView, plain text, atau newline. Satu tap untuk menyalin ke clipboard.",
  },
  {
    icon: Share2,
    title: "Simpan & share",
    body:
      "Simpan watchlist untuk dipakai lagi, atau bagikan via link/gambar ke teman trader.",
  },
];

export function OnboardingDialog({
  forceOpen,
  onClose,
}: {
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setStep(0);
      setOpen(true);
      return;
    }
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [forceOpen]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    onClose?.();
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) finish();
    else setOpen(true);
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <DialogTitle className="font-display text-xl">{slide.title}</DialogTitle>
          <DialogDescription className="text-balance text-sm">
            {slide.body}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={finish}
            className="text-muted-foreground"
          >
            Skip
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            >
              {isLast ? "Get started" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
