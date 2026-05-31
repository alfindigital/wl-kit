import { useEffect } from "react";
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

import appCss from "../styles.css?url";
import ogImage from "@/assets/og-image.jpg";

const OG_IMAGE_URL = `https://wlkit.lovable.app${ogImage}`;
const WEBSITE_URL = "https://wlkit.lovable.app/";

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
  console.error(error);
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
      { title: "WatchlistKit — Free IDX Watchlist Formatter" },
      {
        name: "description",
        content:
          "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share.",
      },
      { name: "author", content: "alfindigital" },
      { property: "og:site_name", content: "WatchlistKit" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: WEBSITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      { name: "twitter:title", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      { property: "og:description", content: "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share." },
      { name: "twitter:description", content: "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share." },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:alt", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      { name: "twitter:image", content: OG_IMAGE_URL },
      { name: "twitter:image:alt", content: "WatchlistKit — Free IDX Watchlist Formatter" },
      { name: "theme-color", content: "#ea580c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "WatchlistKit" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "WatchlistKit",
          url: WEBSITE_URL,
          description:
            "Format your IDX watchlist in seconds. Paste tickers in any format, auto-prefix with IDX:, and export to TradingView, plain text, or lists. Save, merge & share.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150} skipDelayDuration={200}>
        <Outlet />
        <Toaster position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
