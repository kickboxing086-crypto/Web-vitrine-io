const CACHE_NAME = 'web-vitrine-pwa-v26';
const urlsToPrecache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-v5.png',
  '/icon-512-v5.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon.svg'
];

// Install: precache essential offline assets safely
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToPrecache.map(url => cache.add(url).catch(err => console.warn('Precache skip:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

// Activate: purge old caches immediately
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

// Fetch handler
self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle navigation requests: Network-First with cache fallback
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

  // Handle static assets
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
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
