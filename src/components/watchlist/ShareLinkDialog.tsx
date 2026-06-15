import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, QrCode, Share2, ExternalLink, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  tickerCount: number;
};

export function ShareLinkDialog({ open, onOpenChange, url, tickerCount }: Props) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setShowQR(false);
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Auto-select link on open for fast Ctrl/Cmd+C
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [open]);

  useEffect(() => {
    if (!showQR || !canvasRef.current || !url) return;
    let cancelled = false;
    // Lazy-load qrcode (~50KB) only when user opens the QR panel.
    import("qrcode")
      .then(({ default: QRCode }) => {
        if (cancelled || !canvasRef.current) return;
        return QRCode.toCanvas(canvasRef.current, url, {
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to render QR");
      });
    return () => {
      cancelled = true;
    };
  }, [showQR, url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title: "WatchlistKit", url });
    } catch (e) {
      const err = e as DOMException;
      if (err?.name !== "AbortError") toast.error("Share failed");
    }
  };

  const hasNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share watchlist</DialogTitle>
          <DialogDescription>
            Opens WatchlistKit with {tickerCount} {tickerCount === 1 ? "ticker" : "tickers"} preloaded.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="font-mono text-xs"
              aria-label="Share URL"
            />
            <Button
              type="button"
              onClick={handleCopy}
              variant="default"
              size="icon"
              className="shrink-0"
              aria-label="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant={showQR ? "default" : "outline"}
              size="icon"
              onClick={() => setShowQR((v) => !v)}
              aria-expanded={showQR}
              aria-label={showQR ? "Hide QR" : "Show QR"}
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              aria-label="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {hasNativeShare && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNativeShare}
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showQR && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
              <canvas
                ref={canvasRef}
                aria-label="QR code for share link"
                className="rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Scan to open on another device
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
