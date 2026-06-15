import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Copy, Download, ExternalLink, List, MousePointerClick, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ogImage from "@/assets/og-image.jpg";
import { SITE_URL } from "@/lib/site";

const OG_IMAGE = `${SITE_URL}${ogImage}`;
const GUIDE_URL = `${SITE_URL}/guides/import-to-tradingview`;

const FAQS = [
  {
    q: "How do I add multiple stocks to a TradingView watchlist at once?",
    a: "Copy your formatted ticker list from WatchlistKit (TradingView format), open any watchlist panel in TradingView, click the import/menu icon, and paste the comma-separated string. All symbols are added in one action.",
  },
  {
    q: "Does TradingView support IDX tickers?",
    a: "Yes. TradingView recognizes Indonesia Stock Exchange (IDX) symbols when they are prefixed with IDX:, such as IDX:BBCA or IDX:BBRI. WatchlistKit adds this prefix automatically.",
  },
  {
    q: "What if a ticker is not recognized in TradingView?",
    a: "TradingView only supports actively traded symbols. If a ticker was recently delisted or is very illiquid, it may not appear. WatchlistKit flags unknown tickers during formatting so you can review them before importing.",
  },
  {
    q: "Can I import watchlists on TradingView mobile?",
    a: "The bulk-import paste method works best on TradingView web and desktop. The mobile app has limited watchlist-management features, so we recommend importing on desktop first.",
  },
  {
    q: "Is WatchlistKit free?",
    a: "Yes, completely free. No sign-up, no limits, and no ads. Your watchlists are stored locally in your browser.",
  },
];

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
    ],
    links: [
      { rel: "canonical", href: GUIDE_URL },
    ],
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
              author: { "@type": "Organization", name: "alfindigital", url: "https://alfindigital.com" },
              publisher: { "@type": "Organization", name: "WatchlistKit", url: SITE_URL },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides/import-to-tradingview` },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
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

const STEPS = [
  {
    number: 1,
    title: "Paste your IDX tickers into WatchlistKit",
    description:
      "Open WatchlistKit and paste your ticker list into the input box. You can drop them in any format: comma-separated, spaced, one per line, or even copied straight from a PDF or spreadsheet.",
    details: [
      "Accepts raw text, Excel columns, or broker export files",
      "Automatically validates each ticker against the official IDX symbol list",
      "Removes duplicates and sorts alphabetically",
    ],
    icon: Type,
  },
  {
    number: 2,
    title: "Select the TradingView format",
    description:
      "Click the TradingView tab in the output panel. WatchlistKit instantly prefixes every valid ticker with IDX:, the exact format TradingView expects for Indonesia Stock Exchange symbols.",
    details: [
      "Output looks like: IDX:BBCA,IDX:BBRI,IDX:TLKM,…",
      "Only valid 4-letter IDX tickers are included",
      "Invalid or unknown tokens are flagged so you can fix them",
    ],
    icon: List,
  },
  {
    number: 3,
    title: "Copy the formatted list",
    description:
      "Press the Copy button (or Ctrl/Cmd + C) to copy the entire comma-separated line to your clipboard. The output is already optimized for TradingView's import field.",
    details: [
      "One click copies the full formatted string",
      "No need to manually add IDX: prefixes",
      "Clipboard-ready for direct paste into TradingView",
    ],
    icon: Copy,
  },
  {
    number: 4,
    title: "Open TradingView and import",
    description:
      "In TradingView, open a watchlist panel and click the import button (or use the watchlist menu). Paste the formatted ticker string and confirm. All your IDX stocks will appear instantly.",
    details: [
      "Works in both TradingView web and desktop apps",
      "Imports all tickers at once. No adding one by one",
      "Symbols are recognized immediately if they are active on IDX",
    ],
    icon: MousePointerClick,
  },
  {
    number: 5,
    title: "Save your watchlist in TradingView",
    description:
      "Once imported, save the watchlist inside TradingView with a custom name. You can also save the original list in WatchlistKit for quick re-formatting later.",
    details: [
      "Save as a named watchlist in TradingView for easy access",
      "Store the source list in WatchlistKit for future edits",
      "Export as .txt or PNG image for sharing or backup",
    ],
    icon: Download,
  },
];

function ImportToTradingViewGuide() {
  return (
    <div className="min-h-dvh bg-background">
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

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How to Import IDX Watchlists to TradingView
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            The fastest way to bulk-add Indonesian stocks to your TradingView watchlist.
            Format any ticker list in seconds and import them all at once. No manual typing needed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button className="rounded-full px-6">Try WatchlistKit now</Button>
            </Link>
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full px-6 gap-2">
                Open TradingView
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Why this matters */}
        <section aria-labelledby="why-heading" className="mb-14">
          <h2 id="why-heading" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Why traders use WatchlistKit
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Bulk import",
                text: "Add dozens of IDX tickers to TradingView in one paste instead of typing each symbol manually.",
              },
              {
                title: "Auto-format",
                text: "WatchlistKit adds the required IDX: prefix and removes duplicates automatically.",
              },
              {
                title: "Error-free",
                text: "Invalid tickers are flagged instantly so you never import a broken symbol.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/60">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Step-by-step */}
        <section aria-labelledby="steps-heading" className="mb-14">
          <h2 id="steps-heading" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Step-by-step guide
          </h2>
          <div className="mt-6 space-y-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="overflow-hidden border-border/60">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-5 sm:gap-5 sm:p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Step {step.number}
                          </span>
                        </div>
                        <h3 className="mt-1 font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                        <ul className="mt-3 space-y-2">
                          {step.details.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mb-14">
          <h2 id="faq-heading" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-5">
            {[
              {
                q: "How do I add multiple stocks to a TradingView watchlist at once?",
                a: "Copy your formatted ticker list from WatchlistKit (TradingView format), open any watchlist panel in TradingView, click the import/menu icon, and paste the comma-separated string. All symbols are added in one action.",
              },
              {
                q: "Does TradingView support IDX tickers?",
                a: "Yes. TradingView recognizes Indonesia Stock Exchange (IDX) symbols when they are prefixed with IDX:, such as IDX:BBCA or IDX:BBRI. WatchlistKit adds this prefix automatically.",
              },
              {
                q: "What if a ticker is not recognized in TradingView?",
                a: "TradingView only supports actively traded symbols. If a ticker was recently delisted or is very illiquid, it may not appear. WatchlistKit flags unknown tickers during formatting so you can review them before importing.",
              },
              {
                q: "Can I import watchlists on TradingView mobile?",
                a: "The bulk-import paste method works best on TradingView web and desktop. The mobile app has limited watchlist-management features, so we recommend importing on desktop first.",
              },
              {
                q: "Is WatchlistKit free?",
                a: "Yes, completely free. No sign-up, no limits, and no ads. Your watchlists are stored locally in your browser.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Ready to format your watchlist?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Paste your IDX tickers into WatchlistKit and get a TradingView-ready list in seconds.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button size="lg" className="rounded-full px-8">
                Open WatchlistKit
              </Button>
            </Link>
          </div>
        </section>
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
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/guides/import-to-tradingview" className="hover:text-primary transition-colors">
              Guides
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
