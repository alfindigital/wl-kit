import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Send, MessageCircle, Share2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** PNG data URL of the rendered share card, or null while generating. */
  dataUrl: string | null;
  /** Used for file name + share text. */
  name: string;
  /** Text caption to send alongside the image (e.g. share URL + output). */
  shareText: string;
  /** Share URL appended to the caption on WhatsApp/Telegram. */
  shareUrl: string;
};

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function ShareImageDialog({
  open,
  onOpenChange,
  dataUrl,
  name,
  shareText,
  shareUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShareFile, setCanNativeShareFile] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    try {
      const probe = new File([new Blob()], "probe.png", { type: "image/png" });
      setCanNativeShareFile(
        typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }),
      );
    } catch {
      setCanNativeShareFile(false);
    }
  }, []);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const fileName = `${(name || "watchlistkit").replace(/[^a-z0-9-_]+/gi, "-")}.png`;

  const handleCopyImage = async () => {
    if (!dataUrl) return;
    try {
      const blob = await dataUrlToBlob(dataUrl);
      // ClipboardItem with image/png — supported in Chromium, Safari 16.4+.
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Image copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy image — try Download instead");
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    a.click();
    toast.success("Image downloaded");
  };

  const handleNativeShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], fileName, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: name,
        text: shareText,
        url: shareUrl,
      });
    } catch (e) {
      const err = e as DOMException;
      if (err?.name !== "AbortError") toast.error("Share cancelled");
    }
  };

  const caption = encodeURIComponent(`${name}\n${shareText}\n${shareUrl}`);
  const waHref = `https://wa.me/?text=${caption}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${name}\n${shareText}`)}`;

  const openExternal = async (href: string, platform: string) => {
    // Pre-copy the image to clipboard so the user can paste it in the chat.
    if (dataUrl) {
      try {
        const blob = await dataUrlToBlob(dataUrl);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success(`Image copied — paste it in ${platform}`);
      } catch {
        toast(`Opening ${platform}… image not auto-copied, use Download`);
      }
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share as image</DialogTitle>
          <DialogDescription>
            Download, copy, or send a branded preview of your watchlist.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`${name} preview`}
              className="block h-auto w-full"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Generating preview…
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="justify-start"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openExternal(waHref, "WhatsApp")}
            disabled={!dataUrl}
            className="justify-start"
          >
            <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openExternal(tgHref, "Telegram")}
            disabled={!dataUrl}
            className="justify-start"
          >
            <Send className="mr-2 h-4 w-4 text-[#229ED9]" />
            Telegram
          </Button>
        </div>

        {canNativeShareFile && (
          <Button
            type="button"
            onClick={handleNativeShare}
            disabled={!dataUrl}
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share via device…
          </Button>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          WhatsApp & Telegram web links can't auto-attach images — the image is
          copied to your clipboard so you can paste it in the chat.
        </p>
      </DialogContent>
    </Dialog>
  );
}
