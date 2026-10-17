// Lane sw1-b4: records every navigation request it sees (URL and
// resultingClientId); "start.html" is answered with Response.redirect() to a
// network redirect in scope; everything else falls back.
const seen = [];
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  const url = new URL(e.request.url);
  seen.push({ path: url.pathname.split('/').pop() + url.search, resultingClientId: e.resultingClientId });
  if (url.pathname.endsWith('/start.html')) {
    e.respondWith(Response.redirect(new URL('redirect.py?to=final.html', e.request.url).href, 302));
  }
});
self.addEventListener('message', e => {
  e.source.postMessage(seen.splice(0));
});
