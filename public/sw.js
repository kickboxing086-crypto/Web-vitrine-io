const CACHE_NAME = 'web-vitrine-pwa-v20';
const urlsToPrecache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192-v5.png',
  '/icon-512-v5.png',
  '/icon-maskable-192-v5.png',
  '/icon-maskable-512-v5.png',
  '/apple-touch-icon-v5.png',
  '/favicon-v5.png'
];

// Install: precache essential offline assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToPrecache))
  );
  self.skipWaiting();
});

// Activate: purge all old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First for HTML navigation so updates on Vercel reflect instantly
self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle navigation / page requests with Network-First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html') || caches.match(request))
    );
    return;
  }

  // Handle assets with Network-First or Cache-Fallback
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch fresh copy in background for next time (Stale-While-Revalidate)
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
