import { Button } from "@/components/ui/button";
import { Save, ImageDown, Share2, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useIsTouch } from "@/hooks/use-touch";
import { toast } from "sonner";

export function ActionButtons({
  disabled,
  onCopy: _onCopy,
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
  const isTouch = useIsTouch();

  const actions = [
    { label: "Save", icon: Save, onClick: onSave },
    { label: "Download", icon: Download, onClick: onDownload },
    { label: "Image", icon: ImageDown, onClick: onImage },
    { label: "Share", icon: Share2, onClick: onShare },
  ];

  const handleLongPress = (label: string) => {
    toast(label, { duration: 1200 });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ label, icon: Icon, onClick }) => {
          const button = (
            <Button
              onClick={onClick}
              disabled={disabled}
              variant="outline"
              className="h-11 rounded-xl hover:text-primary"
              aria-label={label}
              onContextMenu={
                isTouch
                  ? (e) => {
                      e.preventDefault();
                      handleLongPress(label);
                    }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" />
            </Button>
          );

          if (isTouch) return <div key={label}>{button}</div>;

          return (
            <Tooltip key={label}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
