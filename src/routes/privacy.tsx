import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/watchlist/Footer";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/privacy`;
const TITLE = "Privacy | WatchlistKit";
const DESCRIPTION =
  "WatchlistKit runs entirely in your browser. No account, no tracking, no server storage.";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-2.5 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Short version: your tickers stay on your device.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            <section>
              <h2 className="mb-1.5 text-base font-semibold">No account, no server storage</h2>
              <p>
                WatchlistKit is a browser tool. Everything you paste, save, or edit lives in your
                browser's local storage. Nothing is sent to a server, and nothing is tied to an
                identity.
              </p>
            </section>

            <section>
              <h2 className="mb-1.5 text-base font-semibold">Share links</h2>
              <p>
                When you generate a share link, the tickers are encoded into the URL itself. The
                page reads them back from the URL. No copy is kept anywhere else.
              </p>
            </section>

            <section>
              <h2 className="mb-1.5 text-base font-semibold">Analytics</h2>
              <p>
                We may add privacy-respecting, aggregate analytics (no cookies, no personal data) in
                the future. If we do, we'll list it here.
              </p>
            </section>

            <section>
              <h2 className="mb-1.5 text-base font-semibold">Third-party links</h2>
              <p>
                Opening a ticker in TradingView sends you to tradingview.com, which has its own
                policies. We don't proxy or observe those visits.
              </p>
            </section>

            <section>
              <h2 className="mb-1.5 text-base font-semibold">Clearing your data</h2>
              <p>
                Clear your browser's site data for this domain to remove every saved watchlist and
                preference.
              </p>
            </section>

            <section>
              <h2 className="mb-1.5 text-base font-semibold">Disclaimer</h2>
              <p>
                WatchlistKit is a formatting utility, not investment advice.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
