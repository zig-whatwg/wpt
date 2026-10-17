// Lane sw1-b3: a fetch handler that answers "?wait" only once its client
// replies to a message the handler posts it - a reply a page blocked in a
// synchronous request can never send.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (!new URL(e.request.url).search.includes('wait')) return;
  e.respondWith((async () => {
    const replied = new Promise(resolve => {
      self.addEventListener('message', () => resolve(new Response('replied')), { once: true });
    });
    const client = await self.clients.get(e.clientId);
    if (client) client.postMessage('reply, please');
    return replied;
  })());
});
