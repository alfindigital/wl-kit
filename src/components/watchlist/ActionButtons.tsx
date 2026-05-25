import { Button } from "@/components/ui/button";
import { Save, ImageDown, Share2, Download, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsTouch } from "@/hooks/use-touch";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

const withHaptic = (fn: () => void | Promise<void>) => () => {
  haptic(10);
  return fn();
};

type Action = {
  label: string;
  icon: typeof Save;
  onClick: () => void | Promise<void>;
};

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
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();

  const getTooltipId = (label: string) => `tt-${label.toLowerCase()}`;

  const mobileActions: Action[] = [
    { label: "Copy", icon: Copy, onClick: withHaptic(onCopy) },
    { label: "Save", icon: Save, onClick: withHaptic(onSave) },
    { label: "Download", icon: Download, onClick: withHaptic(onDownload) },
    { label: "Image", icon: ImageDown, onClick: withHaptic(onImage) },
    { label: "Share", icon: Share2, onClick: withHaptic(onShare) },
  ];

  const desktopActions: Action[] = [
    { label: "Save", icon: Save, onClick: onSave },
    { label: "Download", icon: Download, onClick: onDownload },
    { label: "Image", icon: ImageDown, onClick: onImage },
    { label: "Share", icon: Share2, onClick: onShare },
  ];

  if (isMobile) {
    return (
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe pl-safe pr-safe backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)]"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1 px-2 py-2">
          {mobileActions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-label={label}
              className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-primary active:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

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
