// For crane/flakes2-sw-navigation-timing-order.https.html: answers every
// navigation in its scope with a page that carries the worker's readings.
const delay = Number(new URL(self.location).searchParams.get('delay') || 0);
let activateWorkerEnd = 0;
self.addEventListener('activate', (event) => {
  if (!delay) return;
  event.waitUntil(new Promise((resolve) => setTimeout(resolve, delay))
    .then(() => { activateWorkerEnd = performance.now() + performance.timeOrigin; }));
});
self.addEventListener('fetch', (event) => {
  const handleFetchEvent = performance.now() + performance.timeOrigin;
  event.respondWith(new Response(
    `<script>window.handleFetchEvent = ${handleFetchEvent}; window.activateWorkerEnd = ${activateWorkerEnd};<\/script>`,
    { headers: { 'content-type': 'text/html' } }));
});
