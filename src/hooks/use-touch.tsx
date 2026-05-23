import * as React from "react";

/**
 * Detects coarse-pointer (touch) devices. Used to disable hover tooltips
 * in favor of touch-friendly affordances.
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  return isTouch;
}
