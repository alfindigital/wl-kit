import { useMemo, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Trash2,
  Pencil,
  Search,
  GitCompare,
  Combine,
  Check,
  X,
  Pin,
  PinOff,
  Tags,
  ArrowUpDown,
  Download,
  Upload,
} from "lucide-react";
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

type SortKey = "recent" | "name" | "count";

export function SavedWatchlists({
  items,
  onLoad,
  onDelete,
  onRename,
  onMerge,
  onCompare,
  onTogglePin,
  onSetTags,
  onExport,
  onImport,
}: {
  items: SavedWatchlist[];
  onLoad: (item: SavedWatchlist) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMerge: (ids: string[]) => void;
  onCompare: (idA: string, idB: string) => void;
  onTogglePin: (id: string) => void;
  onSetTags: (id: string, tags: string[]) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const [open, setOpen] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SavedWatchlist | null>(null);
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [tagEditId, setTagEditId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const touchStart = useRef<{ x: number; id: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => (i.tags ?? []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return items.filter((it) => {
      if (q) {
        const hit =
          it.name.toUpperCase().includes(q) ||
          it.tickers.some((t) => t.includes(q)) ||
          (it.tags ?? []).some((t) => t.toUpperCase().includes(q));
        if (!hit) return false;
      }
      if (tagFilter && !(it.tags ?? []).includes(tagFilter)) return false;
      return true;
    });
  }, [items, query, tagFilter]);

  const sortFn = (a: SavedWatchlist, b: SavedWatchlist) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "count") return b.tickers.length - a.tickers.length;
    return (b.lastUsedAt ?? b.savedAt) - (a.lastUsedAt ?? a.savedAt);
  };

  const pinned = filtered.filter((i) => i.pinned).sort(sortFn);
  const unpinned = filtered.filter((i) => !i.pinned);
  const recent =
    sortKey === "recent"
      ? unpinned
          .slice()
          .sort(
            (a, b) =>
              (b.lastUsedAt ?? b.savedAt) - (a.lastUsedAt ?? a.savedAt),
          )
          .slice(0, 3)
      : [];
  const recentIds = new Set(recent.map((r) => r.id));
  const rest = unpinned.filter((i) => !recentIds.has(i.id)).sort(sortFn);

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

  const renderItem = (item: SavedWatchlist) => {
    const isEditing = editingId === item.id;
    const isSwiped = swipedId === item.id;
    return (
      <li key={item.id} className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-destructive text-destructive-foreground">
          <button
            type="button"
            onClick={() => {
              setPendingDelete(item);
              setSwipedId(null);
            }}
            className="flex h-full w-full items-center justify-center"
            aria-label={`Delete ${item.name}`}
            tabIndex={isSwiped ? 0 : -1}
            aria-hidden={!isSwiped}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div
          onTouchStart={(e) => handleTouchStart(e, item.id)}
          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && isSwiped) {
              e.stopPropagation();
              setSwipedId(null);
            }
          }}
          className="group flex items-center gap-2 bg-card px-3 py-2 transition-transform hover:bg-muted"
          style={{ transform: isSwiped ? "translateX(-80px)" : "translateX(0)" }}
        >
          {selectMode && (
            <Checkbox
              checked={selected.includes(item.id)}
              onCheckedChange={() => toggleSelect(item.id)}
              aria-label={`Select ${item.name}`}
            />
          )}
          {isEditing ? (
            <div className="flex flex-1 items-center gap-1">
              <Input
                autoFocus
                aria-label="Rename watchlist"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editName.trim()) {
                    e.preventDefault();
                    onRename(item.id, editName.trim());
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingId(null);
                  }
                }}
                className="h-8 rounded-lg text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Confirm rename"
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
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Cancel rename"
                onClick={() => setEditingId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectMode) toggleSelect(item.id);
                    else onLoad(item);
                  }}
                  className="block w-full text-left"
                  aria-label={selectMode ? `Toggle selection ${item.name}` : `Load ${item.name}`}
                >
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {item.pinned && <Pin className="h-3 w-3 text-primary" aria-hidden="true" />}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.tickers.length} tickers ·{" "}
                    {new Date(item.savedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </button>
                {(item.tags ?? []).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(item.tags ?? []).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagFilter(t);
                        }}
                        className="cursor-pointer rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Filter by tag ${t}`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!selectMode && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onTogglePin(item.id)}
                    className="rounded-full text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label={item.pinned ? `Unpin ${item.name}` : `Pin ${item.name}`}
                  >
                    {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Popover
                    open={tagEditId === item.id}
                    onOpenChange={(o) => {
                      if (o) {
                        setTagEditId(item.id);
                        setTagDraft((item.tags ?? []).join(", "));
                      } else {
                        setTagEditId(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`Edit tags for ${item.name}`}
                      >
                        <Tags className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 rounded-xl p-3" align="end">
                      <p className="mb-1.5 text-xs text-muted-foreground">
                        Comma-separated tags
                      </p>
                      <Input
                        autoFocus
                        aria-label="Tags"
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        placeholder="banking, lq45"
                        className="h-8 rounded-lg text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const tags = tagDraft
                              .split(",")
                              .map((t) => t.trim().toLowerCase())
                              .filter(Boolean);
                            onSetTags(item.id, tags);
                            setTagEditId(null);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            setTagEditId(null);
                          }
                        }}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 rounded-lg text-xs"
                          onClick={() => {
                            const tags = tagDraft
                              .split(",")
                              .map((t) => t.trim().toLowerCase())
                              .filter(Boolean);
                            onSetTags(item.id, tags);
                            setTagEditId(null);
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                    className="rounded-full text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label={`Rename ${item.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPendingDelete(item)}
                    className="rounded-full text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                    aria-label={`Delete ${item.name}`}
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
  };


  const sectionHeader = (label: string) => (
    <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </div>
  );

  return (
    <>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="rounded-2xl border border-border/80 bg-card shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={open}
          >
            <span className="text-sm font-semibold text-primary">
              Saved Watchlists{" "}
              <span className="ml-1 font-normal text-muted-foreground">({items.length})</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border/60 px-2 py-2">
            {items.length > 0 && (
              <>
                <div className="flex flex-col gap-2 px-2 pb-2 pt-1 sm:flex-row sm:items-center">
                  {items.length > 5 && (
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search watchlists"
                        placeholder="Search name, ticker, or tag…"
                        className="h-8 rounded-lg pl-8 text-xs"
                      />
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                      >
                        <ArrowUpDown className="mr-1 h-3 w-3" />
                        {sortKey === "recent"
                          ? "Recent"
                          : sortKey === "name"
                            ? "Name"
                            : "Count"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortKey("recent")}>
                        Recent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortKey("name")}>
                        Name A–Z
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortKey("count")}>
                        Most tickers
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                {(allTags.length > 0 || tagFilter) && (
                  <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
                    {tagFilter && (
                      <button
                        onClick={() => setTagFilter(null)}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20"
                      >
                        #{tagFilter} ×
                      </button>
                    )}
                    {!tagFilter &&
                      allTags.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTagFilter(t)}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        >
                          #{t}
                        </button>
                      ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-1 px-2 pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg text-[11px] text-muted-foreground hover:text-primary"
                    onClick={onExport}
                  >
                    <Download className="mr-1 h-3 w-3" /> Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg text-[11px] text-muted-foreground hover:text-primary"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="mr-1 h-3 w-3" /> Import
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onImport(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No saved watchlists yet." : "No matches."}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {pinned.length > 0 && (
                  <>
                    {sectionHeader("Pinned")}
                    <ul className="flex flex-col gap-1">{pinned.map(renderItem)}</ul>
                  </>
                )}
                {recent.length > 0 && (
                  <>
                    {sectionHeader("Recently used")}
                    <ul className="flex flex-col gap-1">{recent.map(renderItem)}</ul>
                  </>
                )}
                {rest.length > 0 && (
                  <>
                    {(pinned.length > 0 || recent.length > 0) && sectionHeader("All")}
                    <ul className="flex flex-col gap-1">{rest.map(renderItem)}</ul>
                  </>
                )}
              </div>
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
