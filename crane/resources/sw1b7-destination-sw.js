// Answers a navigation of its scope with what the fetch event's request and
// Requests made from it say their destination is.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (!new URL(e.request.url).searchParams.has('sw1b7-destination')) return;
  const body = JSON.stringify({
    event: e.request.destination,
    constructed: new Request(e.request).destination,
    with_init: new Request(e.request, { headers: { 'X-Sw1b7': '1' } }).destination,
    clone: e.request.clone().destination,
  });
  e.respondWith(new Response(body, { headers: { 'Content-Type': 'text/plain' } }));
});
