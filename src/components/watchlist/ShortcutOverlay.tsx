import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

type Row = { keys: React.ReactNode; label: string };

export function ShortcutOverlay({
  open,
  onOpenChange,
  onShowOnboarding,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onShowOnboarding?: () => void;
}) {
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Actions",
      rows: [
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>↵</Kbd>
            </>
          ),
          label: "Copy output",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>S</Kbd>
            </>
          ),
          label: "Save watchlist",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>D</Kbd>
            </>
          ),
          label: "Download .txt",
        },
      ],
    },
    {
      title: "Navigation",
      rows: [
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>K</Kbd>
            </>
          ),
          label: "Command palette",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>/</Kbd>
            </>
          ),
          label: "Focus input",
        },
        { keys: <Kbd>?</Kbd>, label: "This shortcut overlay" },
      ],
    },
    {
      title: "Format",
      rows: [
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>1</Kbd>
            </>
          ),
          label: "TradingView",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>2</Kbd>
            </>
          ),
          label: "Plain",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>3</Kbd>
            </>
          ),
          label: "Newline",
        },
      ],
    },
    {
      title: "Sort",
      rows: [
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>A</Kbd>
            </>
          ),
          label: "Sort A → Z",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>Z</Kbd>
            </>
          ),
          label: "Sort Z → A",
        },
        {
          keys: (
            <>
              <Kbd>{mod}</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>O</Kbd>
            </>
          ),
          label: "Original order",
        },
      ],
    },
    {
      title: "Edit",
      rows: [
        {
          keys: (
            <>
              <Kbd>Ctrl</Kbd>
              <Kbd>⌫</Kbd>
            </>
          ),
          label: "Clear input",
        },
        { keys: <Kbd>Esc</Kbd>, label: "Clear (in textarea)" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Press <Kbd>?</Kbd> anytime to open this panel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {s.title}
              </h3>
              <ul className="space-y-2">
                {s.rows.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{r.label}</span>
                    <span className="flex items-center gap-1">{r.keys}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {onShowOnboarding && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="font-sans text-sm text-muted-foreground">
              New here? Take the quick tour.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onShowOnboarding();
              }}
              className="font-sans text-sm"
            >
              Replay onboarding
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
