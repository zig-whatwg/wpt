// A module worker whose top-level await never settles (lk2-worker-module-tla-never-settles.html).
postMessage('started');
await new Promise(() => {});
postMessage('finished');
