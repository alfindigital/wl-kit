// Lightweight haptic feedback wrapper.
// No-op on devices without Vibration API or when the user prefers reduced motion.

export function haptic(pattern: number | number[] = 10): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq && mq.matches) return;
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export const HAPTIC = {
  tap: 10,
  success: [10, 30, 10] as number[],
  warning: [20, 40] as number[],
};
