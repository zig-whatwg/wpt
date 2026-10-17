// Lane sw1-b2: a dedicated worker client. It becomes a service worker
// client by reaching navigator.serviceWorker, and forwards what its service
// worker sends it to its page.
navigator.serviceWorker.onmessage = e => postMessage({ data: e.data, fromServiceWorker: e.source instanceof ServiceWorker });
onmessage = () => postMessage({ ready: true });
