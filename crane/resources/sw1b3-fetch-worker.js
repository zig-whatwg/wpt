// Lane sw1-b3: a service worker whose fetch handler answers by the request's
// `sw` search parameter (Crane tests sw1b3-*).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

const encoder = new TextEncoder();

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  switch (url.searchParams.get("sw")) {
    case "respond":
      e.respondWith(new Response("from the service worker", { headers: { "content-type": "text/plain", "x-sw": "1" } }));
      break;
    case "html":
      e.respondWith(new Response(
        "<!doctype html><title>sw</title><p id=p>from the service worker</p>" +
        "<script>parent.postMessage({ type: 'sw1b3-frame', controlled: !!navigator.serviceWorker.controller, " +
        "text: document.getElementById('p').textContent }, '*');</" + "script>",
        { headers: { "content-type": "text/html" } }));
      break;
    case "passthrough":
      e.respondWith(fetch(e.request));
      break;
    case "reject":
      e.respondWith(Promise.reject(new Error("rejected on purpose")));
      break;
    case "cancel":
      e.preventDefault();
      break;
    case "not-a-response":
      e.respondWith(Promise.resolve("not a Response"));
      break;
    case "stream": {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("first,"));
          setTimeout(() => {
            controller.enqueue(encoder.encode("second"));
            controller.close();
          }, 50);
        },
      });
      e.respondWith(new Response(stream, { headers: { "content-type": "text/plain" } }));
      break;
    }
    case "matchall":
      e.respondWith(self.clients.matchAll({ includeUncontrolled: true }).then(
        clients => new Response(String(clients.length), { headers: { "content-type": "text/plain" } })));
      break;
    case "event":
      e.respondWith(new Response(JSON.stringify({
        isFetchEvent: e instanceof FetchEvent,
        cancelable: e.cancelable,
        mode: e.request.mode,
        destination: e.request.destination,
        method: e.request.method,
        clientIdIsSet: e.clientId.length > 0,
        resultingClientId: e.resultingClientId,
        replacesClientId: e.replacesClientId,
        handledIsPromise: e.handled instanceof Promise,
        preloadIsPromise: e.preloadResponse instanceof Promise,
        header: e.request.headers.get("x-test"),
      }), { headers: { "content-type": "application/json" } }));
      break;
    case "twice":
      e.respondWith(new Response("first answer"));
      try {
        e.respondWith(new Response("second answer"));
        e.waitUntil(Promise.resolve());
      } catch (error) {
        // The second call throws InvalidStateError.
      }
      break;
    default:
      // The network answers.
  }
});
