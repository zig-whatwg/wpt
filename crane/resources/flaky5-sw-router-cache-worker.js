// For crane/flaky5-sw-router-cache-every-cache.https.html: a worker with no
// fetch listener whose one router rule sends everything under
// resources/flaky5-sw-router-cache/ to a cache source - "cache", or
// {cacheName} with ?rule=named - after its install has put cached.txt in the
// cache it opens.
const rule = new URL(self.location).searchParams.get('rule');
const OWN = 'flaky5-router-cache-own';
self.addEventListener('install', (event) => {
  const source = rule === 'named' ? { cacheName: OWN } : 'cache';
  event.addRoutes([{ condition: { urlPattern: '/**/flaky5-sw-router-cache/*' }, source }]);
  event.waitUntil((async () => {
    const cache = await caches.open(OWN);
    await cache.put(new URL('flaky5-sw-router-cache/cached.txt', self.location).href, new Response('From cache'));
  })());
});
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
