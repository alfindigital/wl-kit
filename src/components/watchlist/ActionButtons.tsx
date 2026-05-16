import { Button } from "@/components/ui/button";
import { Copy, Save, ImageDown, Share2, Download } from "lucide-react";
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
  onCopy: () => void;
  onSave: () => void;
  onDownload: () => void;
  onImage: () => void;
  onShare: () => void;
}) {
  const secondary = [
    { label: "Save", icon: Save, onClick: onSave },
    { label: "Download .txt", icon: Download, onClick: onDownload },
    { label: "Image", icon: ImageDown, onClick: onImage },
    { label: "Share", icon: Share2, onClick: onShare },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={onCopy}
        disabled={disabled}
        className="h-11 w-full rounded-xl text-base"
        variant="default"
      >
        <Copy className="mr-2 h-4 w-4" /> Copy
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
