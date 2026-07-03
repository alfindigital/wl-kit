import { Button } from "@/components/ui/button";
import { Save, ImageDown, Share2, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsTouch } from "@/hooks/use-touch";
import { toast } from "sonner";

type Action = {
  label: string;
  icon: typeof Save;
  onClick: () => void | Promise<void>;
};

export function ActionButtons({
  disabled,
  onSave,
  onDownload,
  onImage,
  onShare,
}: {
  disabled: boolean;
  onCopy?: () => void | Promise<void>;
  onSave: () => void;
  onDownload: () => void;
  onImage: () => void;
  onShare: () => void;
}) {
  const isTouch = useIsTouch();

  const getTooltipId = (label: string) => `tt-${label.toLowerCase()}`;

  const desktopActions: Action[] = [
    { label: "Save", icon: Save, onClick: onSave },
    { label: "Download", icon: Download, onClick: onDownload },
    { label: "Image", icon: ImageDown, onClick: onImage },
    { label: "Share", icon: Share2, onClick: onShare },
  ];


  return (
    <div className="grid grid-cols-4 gap-2">
      {desktopActions.map(({ label, icon: Icon, onClick }) => {
        const tooltipId = getTooltipId(label);
        const button = (
          <Button
            onClick={onClick}
            disabled={disabled}
            variant="outline"
            className="h-11 rounded-xl hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={label}
            aria-describedby={isTouch ? tooltipId : undefined}
            onContextMenu={
              isTouch
                ? (e) => {
                    e.preventDefault();
                    toast(label, { duration: 1200 });
                  }
                : undefined
            }
          >
            <Icon className="h-4 w-4" />
          </Button>
        );

        if (isTouch) {
          return (
            <div key={label}>
              {button}
              <span id={tooltipId} className="sr-only">
                {label}
              </span>
            </div>
          );
        }

        return (
          <Tooltip key={label}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
