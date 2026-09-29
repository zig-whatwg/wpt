// A shared worker that answers each connection with how many connections it
// has had, its name, and whether the connect event was shaped as HTML says.
let connections = 0;
onconnect = e => {
  connections++;
  const port = e.ports[0];
  port.postMessage({
    connections,
    name: self.name,
    global: self instanceof SharedWorkerGlobalScope,
    data: e.data,
    portsLength: e.ports.length,
    sourceIsPort: e.source === port,
    isMessageEvent: e instanceof MessageEvent,
  });
  port.onmessage = m => port.postMessage("echo " + m.data);
};
