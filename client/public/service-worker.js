const CACHE_NAME = "mileage-tracker-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/data/mileage_data.json", // cache your distance data
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available, else fetch
      return (
        response ||
        fetch(event.request).catch(() => {
          // Optionally: fallback page if offline
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});
// 🔁 Force new service worker to activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
