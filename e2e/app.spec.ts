import { test, expect, type Page } from "@playwright/test";

// Navigate and wait for the app to hydrate before interacting. The dev server
// compiles modules lazily, so events fired before hydration are lost (React
// re-renders controlled inputs from state). The root sets data-hydrated once
// mounted; gate interactions on it.
async function gotoReady(page: Page, url: string) {
  await page.goto(url);
  await page.locator("html[data-hydrated='true']").waitFor({ timeout: 30_000 });
}

test.describe("WatchlistKit single-page app", () => {
  test.beforeEach(async ({ page }) => {
    // A fresh browser has no localStorage, so the first-run onboarding tour
    // renders a full-screen overlay that intercepts clicks/typing. Disable it
    // before the app loads so interaction tests aren't blocked by it.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("wlkit-onboarded", "1");
      } catch {
        /* storage blocked — ignore */
      }
    });
  });

  test("home page renders the hero and header", async ({ page }) => {
    await gotoReady(page, "/");
    await expect(page.getByRole("heading", { name: /Build IDX watchlist/i })).toBeVisible();
    await expect(page.getByText("WatchlistKit").first()).toBeVisible();
  });

  test("formats pasted IDX tickers into TradingView output", async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByLabel("Ticker input").fill("bbca, bbri, tlkm");
    // TradingView is the default format; output should be prefixed with IDX:.
    // Scope to the output region — the off-screen share card also renders it.
    const output = page.getByLabel("Formatted watchlist output");
    await expect(output.getByText(/IDX:BBCA/)).toBeVisible();
    await expect(page.getByText(/3 tickers/).first()).toBeVisible();
  });

  test("shows typeahead suggestions while typing a partial ticker", async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByLabel("Ticker input").fill("BBC");
    await expect(page.getByRole("button", { name: "BBCA" })).toBeVisible();
  });

  test("opens the TradingView guide modal from the help menu", async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByRole("button", { name: "Help" }).click();
    await page.getByRole("button", { name: /How to import to TradingView/i }).click();
    await expect(
      page.getByRole("heading", { name: /How to Import IDX Watchlists to TradingView/i }),
    ).toBeVisible();
  });

  test("deep-link ?guide=tradingview opens the guide modal", async ({ page }) => {
    await gotoReady(page, "/?guide=tradingview");
    await expect(
      page.getByRole("heading", { name: /How to Import IDX Watchlists to TradingView/i }),
    ).toBeVisible();
  });

  test("the crawlable guide route still renders as a full page", async ({ page }) => {
    await page.goto("/guides/import-to-tradingview");
    await expect(
      page.getByRole("heading", { level: 1, name: /How to Import IDX Watchlists to TradingView/i }),
    ).toBeVisible();
    await expect(page.getByText(/Step-by-step guide/i)).toBeVisible();
  });
});
