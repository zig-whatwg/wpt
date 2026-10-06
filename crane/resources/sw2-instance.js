// workers3 lane: a shared worker that names itself. Every connection hears
// the same random id and how many connections the worker has had; "close"
// closes it, "spin" spins it forever, "nested" asks a dedicated worker it
// starts, "timer" answers from a setTimeout.
const id = Math.random().toString(36).slice(2);
let connections = 0;
onconnect = e => {
  connections++;
  const port = e.ports[0];
  port.onmessage = m => {
    switch (m.data) {
      case "id":
        port.postMessage({ id, connections });
        break;
      case "close":
        close();
        port.postMessage("closing");
        break;
      case "spin":
        port.postMessage("spinning");
        while (true) {}
      case "nested": {
        const source = 'onmessage = e => postMessage("nested " + e.data);';
        const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
        const inner = new Worker(url);
        URL.revokeObjectURL(url);
        inner.onmessage = r => port.postMessage(r.data);
        inner.postMessage(id);
        break;
      }
      case "timer":
        setTimeout(() => port.postMessage("timer " + id), 0);
        break;
    }
  };
};
