import { Globe, Send } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="mt-16 border-t border-border bg-secondary py-4"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:gap-4">
        <span>
          Built with <span className="font-semibold text-primary">WatchlistKit</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://alfindigital.com"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
          >
            <Globe className="h-3.5 w-3.5" />
            alfindigital.com
          </a>
          <a
            href="https://t.me/alfidx"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
          >
            <Send className="h-3.5 w-3.5" />
            @AlfIDX
          </a>
        </div>
      </div>
    </footer>
  );
}
