// Med Global Network (MGN) Service Worker
// Version: 2.0.0 (PWA & Offline Resilience + Push Notifications)

const CACHE_NAME = "mgn-cache-v2";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/logo.png"
];

// Install Event: Precaches essential offline app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[MGN-SW] Pre-cache assets non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleans up obsolete caches and claims existing clients
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

// Fetch Event: Intelligent routing (Network-first for HTML, Stale-while-revalidate for static)
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests with HTTP/HTTPS protocols
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // Bypass API routes, authentication endpoints, and dynamic Next.js image optimizer
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.includes("/auth/")
  ) {
    return;
  }

  // HTML Navigation Requests: Network-First strategy with cache fallback
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match("/").then((fallback) => {
              if (fallback) return fallback;
              return new Response(
                "<!DOCTYPE html><html><head><title>Offline - MGN</title><meta name='viewport' content='width=device-width,initial-scale=1'/><style>body{font-family:sans-serif;background:#faf9f8;color:#171717;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h1{color:#0f4c81;font-size:1.5rem;}p{color:#555;font-size:0.95rem;max-width:400px;line-height:1.5;}</style></head><body><div><h1>Med Global Network</h1><p>You are currently offline. Please reconnect to access real-time medical updates and patient records.</p><button onclick='window.location.reload()' style='background:#0f4c81;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;margin-top:12px;'>Retry Connection</button></div></body></html>",
                { headers: { "Content-Type": "text/html" } }
              );
            });
          });
        })
    );
    return;
  }

  // Static Assets (Scripts, CSS, Fonts, Images): Cache-First / Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Push Event: Handle background web push notifications
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    payload = {
      title: "Med Global Network",
      body: event.data ? event.data.text() : "New healthcare notification received"
    };
  }

  const title = payload.title || "Med Global Network";
  const notificationOptions = {
    body: payload.body || "New medical alert, message, or clinical notification.",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    vibrate: [150, 60, 150, 60, 300],
    data: {
      url: payload.url || payload.link || "/home",
      timestamp: Date.now(),
      ...payload
    },
    actions: [
      { action: "open", title: "Open MGN" },
      { action: "dismiss", title: "Dismiss" }
    ],
    tag: payload.tag || "mgn-notification",
    renotify: true,
    requireInteraction: payload.urgent || false
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

// Notification Click: Handle tap on notification or action buttons
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open on MGN, focus and navigate it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Notification Close: Tracking or cleanup
self.addEventListener("notificationclose", (event) => {
  // Can be used for dismissal analytics if needed
});

// Communication with main thread / Client control
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }

  if (event.data.action === "clearCache") {
    caches.delete(CACHE_NAME).then(() => {
      if (event.source) {
        event.source.postMessage({ status: "cache_cleared" });
      }
    });
  }

  if (event.data.action === "ping") {
    if (event.source) {
      event.source.postMessage({ status: "pong", version: CACHE_NAME });
    }
  }
});
