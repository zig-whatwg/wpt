// Lane sw1-b2: a service worker that answers its clients' messages.
self.addEventListener("message", async e => {
  const data = e.data;
  if (data && data.port) {
    data.port.postMessage("pong");
    return;
  }
  if (data === "describe") {
    const s = e.source;
    s.postMessage({
      origin: e.origin,
      lastEventId: e.lastEventId,
      ports: e.ports.length,
      portsFrozen: Object.isFrozen(e.ports),
      isExtendable: e instanceof ExtendableMessageEvent,
      isTrusted: e.isTrusted,
      sourceType: s.type,
      sourceUrl: s.url,
      frameType: s.frameType,
      isWindowClient: s instanceof WindowClient,
      visibilityState: s.visibilityState,
      focused: s.focused,
      ancestorOrigins: Array.from(s.ancestorOrigins),
      sameAncestorOrigins: s.ancestorOrigins === s.ancestorOrigins,
      id: s.id,
      idIsUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s.id),
    });
    return;
  }
  if (data === "clients") {
    const all = await self.clients.matchAll({ includeUncontrolled: true });
    const controlled = await self.clients.matchAll();
    const got = await self.clients.get(e.source.id);
    const unknown = await self.clients.get("no-such-client");
    e.source.postMessage({
      count: all.length,
      urls: all.map(c => c.url),
      allWindowClients: all.every(c => c instanceof WindowClient),
      controlledCount: controlled.length,
      sameId: !!got && got.id === e.source.id,
      gotUrl: got ? got.url : null,
      unknownIsUndefined: unknown === undefined,
    });
    return;
  }
  if (data === "to-workers") {
    const workers = await self.clients.matchAll({ includeUncontrolled: true, type: "worker" });
    for (const client of workers) client.postMessage("hello worker " + client.type);
    e.source.postMessage({ workers: workers.length, types: workers.map(c => c.type), allPlainClients: workers.every(c => !(c instanceof WindowClient)) });
    return;
  }
  if (data === "waituntil") {
    e.waitUntil(new Promise(resolve => setTimeout(resolve, 10)));
    e.source.postMessage("extended");
    return;
  }
  if (data === "transfer") {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    e.source.postMessage(buffer, [buffer]);
    return;
  }
  if (data === "constructor") {
    const port = new MessageChannel().port1;
    const plain = new ExtendableMessageEvent("type");
    const full = new ExtendableMessageEvent("message", { data: { a: 1 }, origin: "x", lastEventId: "y", source: port, ports: [port] });
    let threw = "no";
    try { new ExtendableMessageEvent("type", { source: {} }); } catch (err) { threw = err.name; }
    e.source.postMessage({
      plainData: plain.data, plainOrigin: plain.origin, plainSource: plain.source, plainPorts: plain.ports.length,
      fullData: full.data.a, fullOrigin: full.origin, fullLastEventId: full.lastEventId,
      fullSourceIsPort: full.source === port, fullPorts: full.ports.length,
      badSource: threw,
    });
    return;
  }
});
