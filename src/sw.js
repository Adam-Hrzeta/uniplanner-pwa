import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname === '/' || requestUrl.pathname.startsWith('/app') || !requestUrl.pathname.includes('.')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open('uniplanner-shell').then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open('uniplanner-shell');
          return cache.match(event.request) || cache.match('/index.html');
        })
    );
  }
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();
