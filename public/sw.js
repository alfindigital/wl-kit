// WatchlistKit service worker — offline + asset caching.
// Strategy:
//   - HTML navigations: network-first (3s timeout) → cache fallback → offline shell
//   - Same-origin static assets (js/css/img/font/manifest): stale-while-revalidate
//   - Cross-origin (e.g. Google Fonts): cache-first with background refresh
// Bumping CACHE_VERSION invalidates old caches on activate.

const CACHE_VERSION = "v2";
const RUNTIME_CACHE = `wk-runtime-${CACHE_VERSION}`;
const HTML_CACHE = `wk-html-${CACHE_VERSION}`;

const OFFLINE_URL = "/";

// Precached at install so the app shell + icons + manifest work fully offline.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const htmlCache = await caches.open(HTML_CACHE);
      try {
        await htmlCache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      } catch {
        // ignore — offline shell will be populated on first successful nav
      }
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      await Promise.allSettled(
        PRECACHE_URLS.filter((u) => u !== OFFLINE_URL).map((u) =>
          runtimeCache.add(new Request(u, { cache: "reload" })),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== RUNTIME_CACHE && k !== HTML_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

async function networkFirstHTML(request) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const fresh = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(OFFLINE_URL));
    if (cached) return cached;
    throw new Error("offline and not cached");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache API / server-fn routes.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn/")) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirstHTML(request));
    return;
  }

  // Same-origin assets + known CDNs (Google Fonts).
  const isAsset =
    url.origin === self.location.origin ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (isAsset) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
