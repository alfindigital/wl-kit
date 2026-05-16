import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2 } from "lucide-react";
import type { SavedWatchlist } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SavedWatchlists({
  items,
  onLoad,
  onDelete,
}: {
  items: SavedWatchlist[];
  onLoad: (item: SavedWatchlist) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SavedWatchlist | null>(null);

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm font-medium">
              Saved Watchlists{" "}
              <span className="ml-1 text-muted-foreground">({items.length})</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/60 px-2 py-2">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No saved watchlists yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <button
                      onClick={() => onLoad(item)}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.tickers.length} tickers ·{" "}
                        {new Date(item.savedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingDelete(item)}
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
