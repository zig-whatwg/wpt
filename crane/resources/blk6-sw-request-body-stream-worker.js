// blk6: a service worker that reads a page's stream request body as it comes.
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/frame.html")) {
    event.respondWith(new Response("<!doctype html><title>frame</title>", { headers: { "content-type": "text/html" } }));
    return;
  }
  if (url.pathname.endsWith("/first-chunk")) {
    // Answers with the body's first chunk while the page's stream is still
    // open: only a body handed on as it arrives gets here.
    event.respondWith((async () => {
      const reader = event.request.body.getReader();
      const { value, done } = await reader.read();
      return new Response(done ? "done" : "got:" + new TextDecoder().decode(value));
    })());
    return;
  }
  if (url.pathname.endsWith("/cancel")) {
    event.respondWith((async () => {
      await event.request.body.cancel("worker cancelled");
      return new Response("cancelled");
    })());
    return;
  }
  if (url.pathname.endsWith("/whole")) {
    event.respondWith((async () => new Response("whole:" + await event.request.text()))());
  }
});
