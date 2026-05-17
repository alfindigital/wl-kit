import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SaveDialog({
  open,
  onOpenChange,
  onSave,
  tickerCount,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (name: string) => void;
  tickerCount: number;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save watchlist</DialogTitle>
          <DialogDescription>
            Saving {tickerCount} {tickerCount === 1 ? "ticker" : "tickers"} to your browser.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          aria-label="Watchlist name"
          placeholder="My watchlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="rounded-xl"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="rounded-xl">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
