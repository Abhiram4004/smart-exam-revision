// SmartRevise Service Worker — Offline & PWA Caching Engine (Network-First)
const CACHE_NAME = 'smartrevise-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 1. Install event: Cache the essential application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean up previous cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting stale cache version:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch event: Network-first for everything (API + bundles), fall back to cache when offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignore non-GET requests (e.g. POST/PUT/DELETE cannot be cached)
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first for all requests so live updates always show immediately,
  // falling back to Cache API when offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If API route failed and not cached, return offline JSON
        if (requestUrl.pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({
              error: 'Offline mode active. Displaying cached revision materials.',
              offline: true
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        }

        // If HTML navigation failed, return cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
