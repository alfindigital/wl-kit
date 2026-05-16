import { Button } from "@/components/ui/button";
import { Copy, Save, ImageDown, Share2 } from "lucide-react";

export function ActionButtons({
  disabled,
  onCopy,
  onSave,
  onImage,
  onShare,
}: {
  disabled: boolean;
  onCopy: () => void;
  onSave: () => void;
  onImage: () => void;
  onShare: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button
        onClick={onCopy}
        disabled={disabled}
        className="rounded-xl"
        variant="default"
      >
        <Copy className="mr-1.5 h-4 w-4" /> Copy
      </Button>
      <Button
        onClick={onSave}
        disabled={disabled}
        variant="outline"
        className="rounded-xl"
      >
        <Save className="mr-1.5 h-4 w-4" /> Save
      </Button>
      <Button
        onClick={onImage}
        disabled={disabled}
        variant="outline"
        className="rounded-xl"
      >
        <ImageDown className="mr-1.5 h-4 w-4" /> Image
      </Button>
      <Button
        onClick={onShare}
        disabled={disabled}
        variant="outline"
        className="rounded-xl"
      >
        <Share2 className="mr-1.5 h-4 w-4" /> Share
      </Button>
    </div>
  );
}
