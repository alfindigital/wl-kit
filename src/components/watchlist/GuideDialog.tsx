import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuideContent } from "./GuideContent";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GuideDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
            {t("guide.title")}
          </DialogTitle>
          <DialogDescription>{t("guide.subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <GuideContent inModal onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
