const CACHE_NAME = 'web-vitrine-pwa-v11';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-v3.png',
  '/icon-192-v3.png',
  '/icon-512-v3.png',
  '/icon-maskable-192-v3.png',
  '/icon-maskable-512-v3.png',
  '/apple-touch-icon-v3.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // Força o Service Worker a assumir o controle imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName)) // Apaga Caches Antigos (incluindo o da letra V)
      );
    })
  );
  // Assume o controle de todas as abas abertas
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
