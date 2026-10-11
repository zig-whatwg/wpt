// A worker that sends or receives a WebAssembly.Module over a MessagePort it is handed,
// for crane/ws-wasm-module-dedicated-worker-cluster.html. Run as a dedicated worker or as a
// shared worker; the control channel is the worker itself or the shared worker's port.
//   "send" + port    -> posts { module } on port, then replies "sent"
//   "receive" + port -> replies "ready", then "message:<kind of data.module>" or "messageerror"
//                       for the next message on port
//   "nest" + port    -> starts a dedicated worker of its own running this script, has it
//                       receive on port, replies "nested", then forwards the sub-worker's reply
const emptyModule = () => new WebAssembly.Module(new Uint8Array([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0]));

function serve(control) {
  control.onmessage = ({ data, ports }) => {
    const port = ports[0];
    if (data === "send") {
      port.postMessage({ module: emptyModule() });
      control.postMessage("sent");
    } else if (data === "receive") {
      port.onmessage = e => control.postMessage(
        "message:" + (e.data && e.data.module instanceof WebAssembly.Module ? "module" : typeof (e.data && e.data.module)));
      port.onmessageerror = () => control.postMessage("messageerror");
      control.postMessage("ready");
    } else if (data === "nest") {
      const sub = new Worker(location.href);
      sub.onmessage = e => {
        if (e.data === "ready") control.postMessage("nested");
        else control.postMessage(e.data);
      };
      sub.postMessage("receive", [port]);
    }
  };
}

if (typeof SharedWorkerGlobalScope !== "undefined" && self instanceof SharedWorkerGlobalScope) {
  onconnect = e => serve(e.ports[0]);
} else {
  serve(self);
}
