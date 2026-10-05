// Med Global Network (MGN) Service Worker
const CACHE_NAME = "mgn-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[MGN-SW] Static pre-caching non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  // Only handle GET requests and http/https schemes
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // Bypass API and auth routes from cache to ensure real-time data
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/image")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache valid basic responses
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached match on network failure
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});
