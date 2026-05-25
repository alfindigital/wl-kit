import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Props = {
  targetRef: React.RefObject<HTMLElement | null>;
};

export function ScrollToInputFab({ targetRef }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && window.scrollY > 200);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );
    io.observe(el);
    const onScroll = () => {
      if (window.scrollY <= 200) setVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [targetRef]);

  const handleClick = () => {
    haptic(8);
    const el = targetRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => (el as HTMLTextAreaElement).focus?.(), 350);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to input"
      className={`fixed right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3.5 py-2.5 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-all duration-200 sm:hidden ${
        visible
          ? "bottom-[calc(88px+env(safe-area-inset-bottom))] opacity-100"
          : "pointer-events-none bottom-[60px] opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" />
      <span>Edit</span>
    </button>
  );
}
