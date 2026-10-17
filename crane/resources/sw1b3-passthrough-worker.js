// Lane sw1-b3's cost probe: a fetch listener that does not answer - every
// fetch goes to the service worker and falls back to the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
