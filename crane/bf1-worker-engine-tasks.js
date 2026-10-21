const view = new Int32Array(new SharedArrayBuffer(4));
Atomics.waitAsync(view, 0, 0, 10).value.then(value => postMessage(value));
