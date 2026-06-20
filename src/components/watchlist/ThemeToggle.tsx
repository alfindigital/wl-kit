import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { haptic } from "@/lib/haptics";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycle } = useTheme();
  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => {
        haptic(8);
        cycle();
      }}
      className={`h-9 w-9 rounded-full text-muted-foreground hover:text-primary ${className ?? ""}`}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
