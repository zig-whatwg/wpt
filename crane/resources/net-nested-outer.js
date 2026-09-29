// The outer worker: makes the inner worker its query names and relays what
// the inner one reports. `?outer-timeout` also arms a timer of its own after
// making the inner worker, which must still fire. `?relay-by-timer=<what>`
// relays from a timer task of its own rather than from the message task.
const params = location.search.slice(1);
const byTimer = params.startsWith("relay-by-timer=");
const innerQuery = byTimer ? "?" + params.slice("relay-by-timer=".length) : location.search;
const inner = new Worker("net-nested-inner.js" + innerQuery);
inner.onmessage = e => {
  if (byTimer) setTimeout(() => postMessage(e.data), 0);
  else postMessage(e.data);
};
inner.onerror = e => { e.preventDefault(); postMessage("inner error: " + e.message); };
if (location.search === "?outer-timeout")
  setTimeout(() => postMessage("outer timeout fired"), 0);
