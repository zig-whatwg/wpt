// The worker side of the wl-* Crane tests. Each message names an operation;
// the reply carries the request id it answers.
"use strict";
const releases = new Map();

async function contend(name, rounds) {
  // Hold the lock `rounds` times; inside it, query() must show this
  // environment as its only holder.
  let overlaps = 0;
  for (let i = 0; i < rounds; i++) {
    await navigator.locks.request(name, async lock => {
      const state = await navigator.locks.query();
      const holders = state.held.filter(l => l.name === name);
      if (holders.length !== 1) overlaps++;
      await null;
    });
  }
  return overlaps;
}

self.onmessage = async e => {
  const { op, id, name } = e.data;
  const reply = data => postMessage(Object.assign({ id }, data));
  switch (op) {
    case "hold":
      // Hold `name` until told to release it.
      navigator.locks.request(name, { mode: e.data.mode || "exclusive" }, () => {
        reply({ held: true });
        return new Promise(resolve => releases.set(name, resolve));
      }).catch(err => reply({ error: err.name }));
      break;
    case "wait":
      // Request `name` and report when it is granted.
      navigator.locks.request(name, () => reply({ granted: true })).catch(err => reply({ error: err.name }));
      reply({ requested: true });
      break;
    case "release":
      releases.get(name)();
      releases.delete(name);
      reply({ released: true });
      break;
    case "contend":
      reply({ overlaps: await contend(name, e.data.rounds) });
      break;
    case "query": {
      const state = await navigator.locks.query();
      reply({ held: state.held.filter(l => l.name === name).length,
              pending: state.pending.filter(l => l.name === name).length });
      break;
    }
  }
};

// A shared worker's connections speak the same protocol.
self.onconnect = e => {
  const port = e.ports[0];
  port.onmessage = m => self.onmessage({ data: m.data, port });
  self.postMessage = data => port.postMessage(data);
};
