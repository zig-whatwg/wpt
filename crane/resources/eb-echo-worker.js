// Echoes each message back as { data, ports, trusted }, transferring any port
// it was given; throws on "throw"; and on "timer" answers from a setTimeout.
self.addEventListener("message", e => {
  if (e.data === "throw") throw new Error("thrown in the worker");
  if (e.data === "timer") {
    setTimeout(function () { self.postMessage({ fromTimer: this === self }); }, 0);
    return;
  }
  self.postMessage({ data: e.data, ports: e.ports.length, trusted: e.isTrusted }, [...e.ports]);
});
