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
    await expect(page.getByRole("heading", { name: /Build weighted watchlist/i })).toBeVisible();
    await expect(page.getByText("WatchlistKit").first()).toBeVisible();
  });

  test("formats pasted tickers into TradingView output", async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByLabel("Ticker input").fill("bbca, bbri, tlkm");
    // TradingView is the default format and IDX: is the default prefix.
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

  test("opens the TradingView guide dialog from the help menu", async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByRole("button", { name: "Help" }).click();
    await page.getByRole("menuitem", { name: /Import to TradingView/i }).click();
    await expect(page.getByRole("dialog")).toContainText(/Import to TradingView/i);
    await expect(page.getByText(/Step-by-step guide/i)).toBeVisible();
  });
});
