// Lane sw1-b3: a service worker that answers a cross-origin no-cors script
// with an opaque response - from fetch() ("?net"), or from its cache
// ("?cache", put there by the fetch it answers with).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (!url.pathname.endsWith('opaque-script-small.js')) return;
  if (url.search === '?net') return e.respondWith(fetch(e.request));
  if (url.search === '?cache') {
    e.respondWith((async () => {
      const cache = await caches.open('sw1b3-opaque');
      const fetched = await fetch(e.request);
      await cache.put(e.request, fetched.clone());
      const cached = await cache.match(e.request);
      return cached || Response.error();
    })());
  }
});
