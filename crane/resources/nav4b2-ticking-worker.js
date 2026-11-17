// A worker that counts its timer ticks (every 20 ms) and the longest gap
// between two of them on the monotonic clock, for lane nav4b2's back/forward
// cache tests: a worker suspended with its cached page has a gap as long as
// the page stayed cached. A dedicated worker started with "?post" posts each
// tick to its owner. Messages: {op, id} -> {id, ...}:
//   stats         -> {ticks, maxGap}
//   reset         -> {} (forgets the longest gap)
//   nest          -> {} once a nested worker of this file runs
//   nested-stats  -> the nested worker's stats
//   broadcast     -> {} after posting {broadcast: value} on every port a
//                    shared worker was connected through
'use strict';

const postTicks = location.search.includes('post');
let ticks = 0;
let last = 0;
let maxGap = 0;
let nested = null;
const ports = [];

setInterval(() => {
  const now = performance.now();
  if (last) maxGap = Math.max(maxGap, now - last);
  last = now;
  ticks++;
  if (postTicks && typeof postMessage === 'function') postMessage({tick: ticks});
}, 20);

function askNested(data) {
  return new Promise(resolve => {
    const id = Math.random();
    const listener = e => {
      if (e.data && e.data.id === id) {
        nested.removeEventListener('message', listener);
        resolve(e.data);
      }
    };
    nested.addEventListener('message', listener);
    nested.postMessage({...data, id});
  });
}

async function answer(data) {
  switch (data.op) {
    case 'stats':
      return {ticks, maxGap};
    case 'reset':
      maxGap = 0;
      if (nested) await askNested({op: 'reset'});
      return {};
    case 'nest':
      nested = new Worker(new URL('nav4b2-ticking-worker.js', location.href).href);
      await askNested({op: 'stats'});
      return {};
    case 'nested-stats':
      return askNested({op: 'stats'});
    case 'broadcast':
      for (const port of ports) port.postMessage({broadcast: data.value});
      return {};
  }
  return {error: 'unknown op ' + data.op};
}

function serve(target) {
  return async e => {
    if (!e.data || e.data.id === undefined) return;
    const reply = await answer(e.data);
    target.postMessage({...reply, id: e.data.id});
  };
}

if ('onconnect' in self) {
  onconnect = e => {
    const port = e.ports[0];
    ports.push(port);
    port.onmessage = serve(port);
  };
} else {
  onmessage = serve(self);
}
