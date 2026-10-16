// Served with Service-Worker-Allowed: /crane/. It skips waiting, and claims
// the clients it matches once it is activating.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
