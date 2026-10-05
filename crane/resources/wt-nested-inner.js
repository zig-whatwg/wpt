// The inner worker of wt-nested-messaging.html.
onmessage = e => {
  if (e.ports.length) {
    // Keep the page's port: when this worker ends, it closes.
    self.kept = e.ports[0];
    self.kept.start();
    postMessage("inner has the port");
    return;
  }
  postMessage("inner <- " + e.data);
};
