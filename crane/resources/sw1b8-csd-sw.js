// Lane sw1-b8's Clear-Site-Data service worker (crane/sw1b8-clear-site-data):
// it answers navigations in its scope with a page, and "csd-from-sw" with a
// response that carries Clear-Site-Data: "storage" - which a response a
// service worker makes must never act on (Clear Site Data 5.2).
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(new Response('<!doctype html><title>controlled</title>', {headers: {'Content-Type': 'text/html'}}));
    return;
  }
  if (event.request.url.endsWith('csd-from-sw')) {
    event.respondWith(new Response('made by the service worker', {headers: {'Clear-Site-Data': '"storage"'}}));
  }
});
