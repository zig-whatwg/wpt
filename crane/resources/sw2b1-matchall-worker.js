// Lane sw2 b1: answers a port with the URLs of its window clients, in
// clients.matchAll()'s order.
self.onmessage = e => {
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(clients => {
    e.data.port.postMessage(clients.map(c => c.url));
  }));
};
