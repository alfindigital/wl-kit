import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Save, ImageDown, Share2, Download, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function ActionButtons({
  disabled,
  onCopy,
  onSave,
  onDownload,
  onImage,
  onShare,
}: {
  disabled: boolean;
  onCopy: () => void | Promise<void>;
  onSave: () => void;
  onDownload: () => void;
  onImage: () => void;
  onShare: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
  };

  const secondary = [
    { label: "Save", icon: Save, onClick: onSave },
    { label: "Download .txt", icon: Download, onClick: onDownload },
    { label: "Image", icon: ImageDown, onClick: onImage },
    { label: "Share", icon: Share2, onClick: onShare },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleCopy}
        disabled={disabled}
        className="h-11 w-full rounded-xl text-base"
        variant="default"
      >
        <span className="relative mr-2 inline-flex h-4 w-4 items-center justify-center">
          <Copy
            className={`absolute h-4 w-4 transition-all duration-200 ${
              copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <Check
            className={`absolute h-4 w-4 transition-all duration-200 ${
              copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          />
        </span>
        {copied ? "Copied!" : "Copy"}
      </Button>
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-4 gap-2">
          {secondary.map(({ label, icon: Icon, onClick }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  onClick={onClick}
                  disabled={disabled}
                  variant="outline"
                  className="h-10 rounded-xl hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
