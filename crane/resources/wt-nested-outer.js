// The outer worker of wt-nested-messaging.html: relays between its page and
// an inner worker of its own.
const inner = new Worker("wt-nested-inner.js");
inner.onmessage = e => postMessage("page <- outer <- " + e.data);
onmessage = e => {
  if (e.data === "close") { close(); return; }
  if (e.ports.length) { inner.postMessage("port", [e.ports[0]]); return; }
  inner.postMessage("outer <- page: " + e.data);
};
