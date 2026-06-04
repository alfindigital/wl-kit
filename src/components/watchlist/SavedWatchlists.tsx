import { useId, useMemo, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  MoreVertical,
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

type SortKey =
  | "recent"
  | "name"
  | "name-desc"
  | "created-new"
  | "created-old"
  | "count";

const SORT_LABEL: Record<SortKey, string> = {
  recent: "Recent",
  name: "Name A–Z",
  "name-desc": "Name Z–A",
  "created-new": "Newest",
  "created-old": "Oldest",
  count: "Most tickers",
};

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
  const [renameError, setRenameError] = useState<string | null>(null);
  const renameErrorId = useId();
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [tagEditId, setTagEditId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const touchStart = useRef<{ x: number; id: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const drawerItem = drawerId ? items.find((i) => i.id === drawerId) ?? null : null;

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
    if (sortKey === "name-desc") return b.name.localeCompare(a.name);
    if (sortKey === "created-new") return b.savedAt - a.savedAt;
    if (sortKey === "created-old") return a.savedAt - b.savedAt;
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

  const validateRename = (
    id: string,
    value: string,
  ): { ok: boolean; error: string | null } => {
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, error: "Name cannot be empty." };
    const lower = trimmed.toLowerCase();
    const dup = items.some(
      (w) => w.id !== id && w.name.trim().toLowerCase() === lower,
    );
    if (dup) {
      return {
        ok: false,
        error: `A watchlist named “${trimmed}” already exists.`,
      };
    }
    return { ok: true, error: null };
  };

  const commitRename = (id: string) => {
    const { ok, error } = validateRename(id, editName);
    if (!ok) {
      setRenameError(error);
      return;
    }
    onRename(id, editName.trim());
    setEditingId(null);
    setRenameError(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setRenameError(null);
  };

  const renderItem = (item: SavedWatchlist) => {
    const isEditing = editingId === item.id;
    const isSwiped = swipedId === item.id;
    const liveError = isEditing
      ? validateRename(item.id, editName).error
      : null;
    const showError = isEditing && (renameError ?? (editName.trim() ? liveError : null));
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
          className="group flex items-start gap-2 bg-card px-3 py-2 transition-transform hover:bg-muted"
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
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  aria-label={`Rename watchlist ${item.name}`}
                  aria-invalid={!!showError}
                  aria-describedby={showError ? `${renameErrorId}-${item.id}` : undefined}
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (renameError) setRenameError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitRename(item.id);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelRename();
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
                  disabled={!!validateRename(item.id, editName).error}
                  onClick={() => commitRename(item.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Cancel rename"
                  onClick={cancelRename}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {showError && (
                <p
                  id={`${renameErrorId}-${item.id}`}
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {showError}
                </p>
              )}
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
              {!selectMode && !isMobile && (
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
              {!selectMode && isMobile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawerId(item.id);
                  }}
                  className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`More actions for ${item.name}`}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
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
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (selectMode) {
              e.stopPropagation();
              exitSelectMode();
            } else if (swipedId) {
              e.stopPropagation();
              setSwipedId(null);
            }
          }
        }}
        className="rounded-2xl border border-border/80 bg-card shadow-sm"
      >

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={open}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Saved Watchlists
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full text-xs"
                role="status"
                aria-label={`${items.length} saved ${items.length === 1 ? "watchlist" : "watchlists"}`}
              >
                {items.length} {items.length === 1 ? "saved" : "saved"}
              </Badge>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
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
                if (pendingDelete) {
                  import("@/lib/haptics").then(({ haptic }) => haptic([20, 40]));
                  onDelete(pendingDelete.id);
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer open={!!drawerItem} onOpenChange={(o) => !o && setDrawerId(null)}>
        <DrawerContent className="pb-safe">
          {drawerItem && (
            <>
              <DrawerHeader className="text-left">
                <DrawerTitle className="flex items-center gap-2 text-base">
                  {drawerItem.pinned && (
                    <Pin className="h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                  <span className="truncate">{drawerItem.name}</span>
                </DrawerTitle>
                <p className="text-xs text-muted-foreground">
                  {drawerItem.tickers.length} tickers
                </p>
              </DrawerHeader>
              <div className="flex flex-col px-2 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    onTogglePin(drawerItem.id);
                    setDrawerId(null);
                  }}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {drawerItem.pinned ? (
                    <PinOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Pin className="h-5 w-5 text-muted-foreground" />
                  )}
                  {drawerItem.pinned ? "Unpin" : "Pin to top"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(drawerItem.id);
                    setEditName(drawerItem.name);
                    setDrawerId(null);
                  }}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTagEditId(drawerItem.id);
                    setTagDraft((drawerItem.tags ?? []).join(", "));
                    setDrawerId(null);
                  }}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Tags className="h-5 w-5 text-muted-foreground" />
                  Edit tags
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectMode(true);
                    setSelected([drawerItem.id]);
                    setDrawerId(null);
                  }}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <GitCompare className="h-5 w-5 text-muted-foreground" />
                  Compare with…
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setPendingDelete(drawerItem);
                    setDrawerId(null);
                  }}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-sm text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Mobile tag editor (drawer-triggered uses same popover-less flow via AlertDialog-like sheet) */}
      {tagEditId && isMobile && (
        <Drawer
          open={!!tagEditId}
          onOpenChange={(o) => {
            if (!o) setTagEditId(null);
          }}
        >
          <DrawerContent className="pb-safe">
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-base">Edit tags</DrawerTitle>
              <p className="text-xs text-muted-foreground">Comma-separated tags</p>
            </DrawerHeader>
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Input
                autoFocus
                aria-label="Tags"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                placeholder="banking, lq45"
                className="h-11 rounded-lg text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-lg"
                  onClick={() => setTagEditId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-lg"
                  onClick={() => {
                    const tags = tagDraft
                      .split(",")
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean);
                    if (tagEditId) onSetTags(tagEditId, tags);
                    setTagEditId(null);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
