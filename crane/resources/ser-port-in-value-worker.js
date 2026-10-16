// The worker side of ser-transfer-port-in-value.html: the message IS a transferred MessagePort
// (worker.postMessage(port, [port])); it must be the port the event carries, and it works.
onmessage = e => {
  const port = e.data;
  port.postMessage([port instanceof MessagePort, e.ports.length === 1 && port === e.ports[0]]);
};
