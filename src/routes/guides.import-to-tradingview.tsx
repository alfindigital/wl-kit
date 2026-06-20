import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ogImage from "@/assets/og-image.jpg";
import { SITE_URL } from "@/lib/site";
import { GuideContent, GUIDE_FAQS } from "@/components/watchlist/GuideContent";

const OG_IMAGE = `${SITE_URL}${ogImage}`;
const GUIDE_URL = `${SITE_URL}/guides/import-to-tradingview`;

export const Route = createFileRoute("/guides/import-to-tradingview")({
  component: ImportToTradingViewGuide,
  head: () => ({
    meta: [
      { title: "Import IDX Watchlists to TradingView | WatchlistKit" },
      {
        name: "description",
        content:
          "Step-by-step tutorial: format your IDX (Indonesia Stock Exchange) tickers with WatchlistKit and import them into TradingView in seconds. No manual typing needed.",
      },
      { property: "og:url", content: GUIDE_URL },
      { property: "og:title", content: "How to Import IDX Watchlists to TradingView" },
      {
        property: "og:description",
        content:
          "Format IDX tickers and bulk-import them into TradingView. A quick guide for Indonesian stock traders.",
      },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "How to Import IDX Watchlists to TradingView" },
      {
        name: "twitter:description",
        content:
          "Format IDX tickers and bulk-import them into TradingView. A quick guide for Indonesian stock traders.",
      },
      { name: "twitter:image", content: OG_IMAGE },
      { property: "og:type", content: "article" },
      { property: "og:locale", content: "en_US" },
    ],
    links: [{ rel: "canonical", href: GUIDE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "How to Import IDX Watchlists to TradingView",
              description:
                "Step-by-step tutorial: format your IDX tickers with WatchlistKit and import them into TradingView in seconds.",
              image: OG_IMAGE,
              mainEntityOfPage: GUIDE_URL,
              author: {
                "@type": "Organization",
                name: "alfindigital",
                url: "https://alfindigital.com",
              },
              publisher: { "@type": "Organization", name: "WatchlistKit", url: SITE_URL },
              inLanguage: "en-US",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "How to Import IDX Watchlists to TradingView",
                  item: GUIDE_URL,
                },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: GUIDE_FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function ImportToTradingViewGuide() {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to WatchlistKit
          </Link>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            WatchlistKit
          </span>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <GuideContent />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WatchlistKit by{" "}
            <a
              href="https://alfindigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              alfindigital
            </a>
          </span>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link
              to="/guides/import-to-tradingview"
              className="transition-colors hover:text-primary"
            >
              Guides
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
