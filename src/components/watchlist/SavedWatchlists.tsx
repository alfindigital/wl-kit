import { useMemo, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Trash2, Pencil, Search, GitCompare, Combine, Check, X } from "lucide-react";
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
  onRename,
  onMerge,
  onCompare,
}: {
  items: SavedWatchlist[];
  onLoad: (item: SavedWatchlist) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMerge: (ids: string[]) => void;
  onCompare: (idA: string, idB: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SavedWatchlist | null>(null);
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; id: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toUpperCase().includes(q) ||
        it.tickers.some((t) => t.includes(q)),
    );
  }, [items, query]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStart.current = { x: e.touches[0].clientX, id };
  };
  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (!touchStart.current || touchStart.current.id !== id) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (dx < -60) setSwipedId(id);
    else if (dx > 30) setSwipedId(null);
    touchStart.current = null;
  };

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
            {items.length > 0 && (
              <div className="flex flex-col gap-2 px-2 pb-2 pt-1 sm:flex-row sm:items-center">
                {items.length > 5 && (
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or ticker…"
                      className="h-8 rounded-lg pl-8 text-xs"
                    />
                  </div>
                )}
                {!selectMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setSelectMode(true)}
                  >
                    Select
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    {selected.length >= 2 && (
                      <Button
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => {
                          onMerge(selected);
                          exitSelectMode();
                        }}
                      >
                        <Combine className="mr-1 h-3.5 w-3.5" /> Merge
                      </Button>
                    )}
                    {selected.length === 2 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => {
                          onCompare(selected[0], selected[1]);
                          exitSelectMode();
                        }}
                      >
                        <GitCompare className="mr-1 h-3.5 w-3.5" /> Compare
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-lg text-xs"
                      onClick={exitSelectMode}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No saved watchlists yet." : "No matches."}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((item) => {
                  const isEditing = editingId === item.id;
                  const isSwiped = swipedId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="relative overflow-hidden rounded-xl"
                    >
                      {/* swipe reveal */}
                      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-destructive text-destructive-foreground">
                        <button
                          onClick={() => {
                            setPendingDelete(item);
                            setSwipedId(null);
                          }}
                          className="flex h-full w-full items-center justify-center"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div
                        onTouchStart={(e) => handleTouchStart(e, item.id)}
                        onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                        className="group flex items-center gap-2 bg-card px-3 py-2 transition-transform hover:bg-muted"
                        style={{ transform: isSwiped ? "translateX(-80px)" : "translateX(0)" }}
                      >
                        {selectMode && (
                          <Checkbox
                            checked={selected.includes(item.id)}
                            onCheckedChange={() => toggleSelect(item.id)}
                          />
                        )}
                        {isEditing ? (
                          <div className="flex flex-1 items-center gap-1">
                            <Input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && editName.trim()) {
                                  onRename(item.id, editName.trim());
                                  setEditingId(null);
                                } else if (e.key === "Escape") setEditingId(null);
                              }}
                              className="h-8 rounded-lg text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                if (editName.trim()) {
                                  onRename(item.id, editName.trim());
                                  setEditingId(null);
                                }
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                if (selectMode) toggleSelect(item.id);
                                else onLoad(item);
                              }}
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
                            {!selectMode && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditName(item.name);
                                  }}
                                  className="rounded-full text-muted-foreground hover:text-primary"
                                  aria-label="Rename"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setPendingDelete(item)}
                                  className="rounded-full text-muted-foreground hover:text-destructive"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
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
