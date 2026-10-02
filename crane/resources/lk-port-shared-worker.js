// leaks lane: a shared worker that keeps the port its connect event hands it.
const ports = [];
onconnect = e => {
  const port = e.ports[0];
  ports.push(port);
  port.postMessage('connected');
};
