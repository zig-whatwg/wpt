// Lane nav2 batch 10 (Crane test nav2b10-sw-frame-type-reused-window): answers
// a port with each window client's URL and frame type as clients.matchAll()
// and clients.get() report it - both run Service Workers' "Get Frame Type".
self.addEventListener("message", e => {
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
    const out = [];
    for (const client of all) {
      const got = await self.clients.get(client.id);
      out.push({ url: client.url, matchAll: client.frameType, get: got ? got.frameType : "no client" });
    }
    e.data.port.postMessage(out);
  })());
});
