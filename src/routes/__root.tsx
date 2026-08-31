import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { registerServiceWorker } from "@/lib/register-sw";
import { initAnalytics, trackPageView } from "@/lib/analytics";

import appCss from "../styles.css?url";
import ogImage from "@/assets/og-image.jpg";
import { SITE_URL } from "@/lib/site";

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("[AppErrorBoundary]", error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reload
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const OG_IMAGE_URL = `${SITE_URL}${ogImage}`;
const WEBSITE_URL = `${SITE_URL}/`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  if (import.meta.env.DEV) console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "WatchlistKit | Free Watchlist Formatter" },
      {
        name: "description",
        content:
          "Format your watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      { name: "author", content: "lotmetrik" },
      { property: "og:site_name", content: "WatchlistKit" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: WEBSITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "WatchlistKit | Free Watchlist Formatter" },
      { name: "twitter:title", content: "WatchlistKit | Free Watchlist Formatter" },
      {
        property: "og:description",
        content:
          "Format your watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      {
        name: "twitter:description",
        content:
          "Format your watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
      },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:alt", content: "WatchlistKit | Free Watchlist Formatter" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:image", content: OG_IMAGE_URL },
      { name: "twitter:image:alt", content: "WatchlistKit | Free Watchlist Formatter" },
      { name: "theme-color", content: "#ea580c", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
      { name: "robots", content: "index,follow" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "WatchlistKit" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      // Load Google Fonts CSS without blocking initial render: request as
      // print stylesheet (non-blocking), then swap to all once loaded.
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap",
        media: "print",
        onload: "this.media='all'",
      } as { rel: string; href: string; media: string; onload: string },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "WatchlistKit",
          url: WEBSITE_URL,
          inLanguage: "en-US",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript. Requires HTML5.",
          description:
            "Format your watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
          image: OG_IMAGE_URL,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },

          author: {
            "@type": "Organization",
            name: "lotmetrik",
            url: SITE_URL,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "WatchlistKit",
          url: WEBSITE_URL,
          inLanguage: "en-US",
          description:
            "Format your watchlist in seconds. Paste tickers in any format, export to TradingView, plain text, or a list. Save & share.",
          publisher: {
            "@type": "Organization",
            name: "lotmetrik",
            url: SITE_URL,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "lotmetrik",
          url: SITE_URL,
          logo: `${SITE_URL}/icon-512.png`,
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const NO_FOUC_SCRIPT = `(function(){try{var t=localStorage.getItem('wlkit-theme')||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: NO_FOUC_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    registerServiceWorker();
    // Mark the document as hydrated so end-to-end tests can wait for the app
    // to become interactive before firing events (harmless in production).
    document.documentElement.setAttribute("data-hydrated", "true");
    initAnalytics();
  }, []);

  // SPA route changes need a manual page_view; gtag only tracks the first load.
  useEffect(() => {
    return router.subscribe("onResolved", ({ toLocation }) => {
      trackPageView(toLocation.pathname);
    });
  }, [router]);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={150} skipDelayDuration={200}>
          <Outlet />
          <Toaster position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

