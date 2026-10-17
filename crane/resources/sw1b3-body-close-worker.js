let bodyController;
self.addEventListener('message', evt => {
  let closed = 'no controller';
  if (bodyController) {
    try { bodyController.close(); closed = 'closed'; } catch (e) { closed = 'threw ' + e; }
  }
  evt.source.postMessage('got ' + evt.data + ': ' + closed);
});
self.addEventListener('fetch', evt => {
  if (!evt.request.url.includes('partial-stream.txt')) return;
  let body = new ReadableStream({
    start: controller => {
      controller.enqueue(new TextEncoder().encode('partial-stream-content'));
      bodyController = controller;
    },
  });
  evt.respondWith(new Response(body));
});
