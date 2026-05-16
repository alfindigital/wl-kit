import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/theme";

function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-primary"
    >
      {/* magnifying glass */}
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.2" y2="15.2" />
      {/* tiny stock chart inside */}
      <polyline points="7,12.5 9,10.5 11,11.5 14,7.8" />
      <line x1="7" y1="13.6" x2="14" y2="13.6" opacity="0.5" />
    </svg>
  );
}

export function Header({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-secondary">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-base font-semibold tracking-tight">WatchlistKit</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Toggle theme"
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
