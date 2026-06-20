import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuideContent } from "./GuideContent";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GuideDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
            How to Import IDX Watchlists to TradingView
          </DialogTitle>
          <DialogDescription>
            Format any IDX ticker list and bulk-import it into TradingView in seconds — no manual
            typing.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <GuideContent inModal onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
