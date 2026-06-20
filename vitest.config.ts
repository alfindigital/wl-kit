import { defineConfig } from "vitest/config";

// Unit tests live alongside the source in src/. Scope Vitest to those so it
// never tries to collect the Playwright specs under e2e/ (which would fail
// because Playwright's test.describe cannot run inside Vitest).
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
