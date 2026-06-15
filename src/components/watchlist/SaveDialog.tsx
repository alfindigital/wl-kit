import { useState, useEffect, useRef, useId, useMemo } from "react";
import {
  Dialog,
  DialogContent,
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
  existingNames = [],
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (name: string) => void;
  existingNames?: string[];
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (open) {
      setName("");
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const normalized = useMemo(
    () => new Set(existingNames.map((n) => n.trim().toLowerCase())),
    [existingNames],
  );
  const trimmed = name.trim();
  const isDuplicate = trimmed.length > 0 && normalized.has(trimmed.toLowerCase());
  const canSave = trimmed.length > 0 && !isDuplicate;

  const handleSave = () => {
    if (!canSave) return;
    onSave(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save watchlist</DialogTitle>
        </DialogHeader>
        <Input
          ref={inputRef}
          aria-label="Watchlist name"
          aria-invalid={isDuplicate}
          aria-describedby={isDuplicate ? errorId : undefined}
          placeholder="My watchlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          className="rounded-xl"
        />
        {isDuplicate && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            A watchlist named “{trimmed}” already exists. Please choose a different name.
          </p>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave} className="rounded-xl">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
