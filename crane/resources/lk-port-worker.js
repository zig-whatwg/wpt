// leaks lane: a dedicated worker that keeps a transferred MessagePort.
let kept = null;
onmessage = e => {
  kept = e.ports[0];
  kept.postMessage('kept');
};
