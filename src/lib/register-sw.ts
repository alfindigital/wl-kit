// Conditionally registers /sw.js — only in production, never in the Lovable
// editor preview or any iframe context (would otherwise serve stale shells).

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  const isProd = import.meta.env.PROD;

  if (!isProd || isInIframe || isPreviewHost) {
    // Defensively unregister any SW left over from prior visits in these contexts.
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      if (import.meta.env.DEV) console.warn("SW registration failed:", err);
    });
  });
}
