// Lane sw1-b4: answers navigations with event.preloadResponse, and names
// what preloadResponse resolved with otherwise.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.searchParams.has('use-preload')) {
    e.respondWith(e.preloadResponse.then(r => r || new Response('<body>undefined</body>', {headers: {'Content-Type': 'text/html'}})));
    return;
  }
  if (url.searchParams.has('describe')) {
    e.respondWith(e.preloadResponse.then(
        r => new Response(r === undefined ? 'undefined' : 'type=' + r.type + ' status=' + r.status),
        err => new Response('rejected ' + err.name)));
    return;
  }
});

self.addEventListener('message', e => {
  const np = self.registration.navigationPreload;
  const done = v => e.source.postMessage(v);
  switch (e.data) {
    case 'enable': e.waitUntil(np.enable().then(() => done('enabled'))); break;
    case 'disable': e.waitUntil(np.disable().then(() => done('disabled'))); break;
    case 'state': e.waitUntil(np.getState().then(s => done(JSON.stringify(s)))); break;
  }
});
