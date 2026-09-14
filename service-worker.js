/* Music Challenge — offline cache worker
   Drop this file in the SAME folder as your Music Challenge HTML file
   on your web host. The app registers it automatically. Once a player
   has opened the app one time with internet, their browser will keep
   a cached copy so it opens again with no data connection at all. */

const CACHE_NAME = 'music-challenge-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for GET requests, falling back to cache when offline.
// Every successful response is saved so the next offline visit works.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fall back to the cached app shell for navigations
          if (event.request.mode === 'navigate') {
            return caches.match('./');
          }
          return undefined;
        })
      )
  );
});
