/**
 * Lightweight GA4 (gtag.js) wrapper.
 *
 * The measurement ID arrives from the Google Analytics connector as
 * VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY. When it is missing the
 * helpers become no-ops so the app keeps working without analytics.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] as
  | string
  | undefined;

let initialized = false;

export function isAnalyticsEnabled() {
  return typeof window !== "undefined" && !!MEASUREMENT_ID;
}

/** Loads gtag.js once, on the client. Safe to call repeatedly. */
export function initAnalytics() {
  if (initialized || !isAnalyticsEnabled()) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, { send_page_view: true });
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Sends a custom GA4 event. No-op when analytics is not configured. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!isAnalyticsEnabled()) {
    if (import.meta.env.DEV) console.warn("[analytics] skipped", name, params);
    return;
  }
  initAnalytics();
  gtag("event", name, params);
}

/** Manual page_view for client-side route changes. */
export function trackPageView(path: string) {
  trackEvent("page_view", { page_path: path, page_location: window.location.href });
}

/* ---------------------------------------------------------------------------
 * Telegram popup funnel
 *
 * Event flow (all share popup_id + variant so CTR can be sliced in GA4):
 *   tg_popup_impression -> tg_popup_click | tg_popup_dismiss | tg_popup_timeout
 * CTR = tg_popup_click / tg_popup_impression.
 * ------------------------------------------------------------------------- */

export type PopupDismissReason = "close_button" | "backdrop" | "escape" | "timeout";

const POPUP_ID = "telegram_join";

export function trackPopupImpression(variant: string) {
  trackEvent("tg_popup_impression", { popup_id: POPUP_ID, variant });
}

export function trackPopupClick(variant: string, secondsVisible: number, target: string) {
  trackEvent("tg_popup_click", {
    popup_id: POPUP_ID,
    variant,
    seconds_visible: secondsVisible,
    link_url: target,
  });
}

export function trackPopupDismiss(
  variant: string,
  reason: PopupDismissReason,
  secondsVisible: number,
) {
  trackEvent(reason === "timeout" ? "tg_popup_timeout" : "tg_popup_dismiss", {
    popup_id: POPUP_ID,
    variant,
    dismiss_reason: reason,
    seconds_visible: secondsVisible,
  });
}

/** Engagement signal: user hovered/held the CTA without clicking. */
export function trackPopupHover(variant: string) {
  trackEvent("tg_popup_cta_hover", { popup_id: POPUP_ID, variant });
}

/** Clicks on the persistent Telegram link in the footer, for comparison. */
export function trackTelegramLink(placement: string) {
  trackEvent("telegram_link_click", { placement });
}
