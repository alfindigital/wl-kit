import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
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
  dataUrl: string | null;
  name: string;
  shareText: string;
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

  const fileName = `${(name || "watchlistkit").replace(/[^a-z0-9-_]+/gi, "-")}.png`;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share as image</DialogTitle>
          <DialogDescription>
            Download a branded preview of your watchlist.
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

        <Button
          type="button"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>

        {canNativeShareFile && (
          <Button
            type="button"
            variant="outline"
            onClick={handleNativeShare}
            disabled={!dataUrl}
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share via device…
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
