// Answers every fetch of a URL with ?answer=<kind> itself; the rest go to
// the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  const answer = new URL(e.request.url).searchParams.get('answer');
  if (answer === 'null') e.respondWith(new Response(null));
  else if (answer === 'string-null') e.respondWith(new Response(new URL(e.request.url).searchParams.get('nonce')));
  else if (answer === 'css') e.respondWith(new Response('p { color: green }', {headers: {'Content-Type': 'text/css'}}));
});
