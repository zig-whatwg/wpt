// A shared worker that only answers: held alive by its page's port.
onconnect = e => {
  const port = e.ports[0];
  port.onmessage = () => port.postMessage("ready");
  port.start();
};
