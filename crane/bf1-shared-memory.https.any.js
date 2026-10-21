// META: global=window,dedicatedworker
// META: timeout=long

test(() => {
  const source = new SharedArrayBuffer(16);
  const view = new Int32Array(source);
  view[0] = 17;
  const clone = structuredClone({a: source, b: source, view});
  assert_not_equals(clone.a, source);
  assert_equals(clone.a, clone.b);
  assert_equals(clone.view.buffer, clone.a);
  clone.view[0] = 23;
  assert_equals(view[0], 23);
}, 'Structured clone preserves shared backing memory and graph identity');

test(() => {
  const source = new SharedArrayBuffer(8, {maxByteLength: 32});
  const clone = structuredClone(source);
  assert_true(clone.growable);
  assert_equals(clone.maxByteLength, 32);
  source.grow(24);
  assert_equals(clone.byteLength, 24);
  clone.grow(32);
  assert_equals(source.byteLength, 32);
}, 'Growable SharedArrayBuffer clones share the live length and maximum');

promise_test(async t => {
  const channel = new MessageChannel();
  t.add_cleanup(() => { channel.port1.close(); channel.port2.close(); });
  const source = new SharedArrayBuffer(4);
  const result = new Promise(resolve => channel.port2.onmessage = e => resolve(e.data));
  channel.port1.postMessage({source, view: new Int32Array(source)});
  const clone = await result;
  assert_equals(clone.view.buffer, clone.source);
  clone.view[0] = 29;
  assert_equals(new Int32Array(source)[0], 29);
}, 'MessagePort preserves shared memory across its queued message');

promise_test(async t => {
  const worker = new Worker('bf1-shared-memory-worker.js');
  t.add_cleanup(() => worker.terminate());
  const source = new SharedArrayBuffer(4);
  const result = new Promise((resolve, reject) => {
    worker.onmessage = e => resolve(e.data);
    worker.onmessageerror = reject;
    worker.onerror = reject;
  });
  worker.postMessage(source);
  const clone = await result;
  assert_not_equals(clone.buffer, source);
  assert_equals(clone.buffer, clone.view.buffer);
  assert_equals(new Int32Array(source)[0], 31);
  clone.view[0] = 37;
  assert_equals(new Int32Array(source)[0], 37);
}, 'Worker messages share memory between agents in one cluster');

promise_test(async t => {
  const name = 'bf1-' + Math.random();
  const sender = new BroadcastChannel(name);
  const receiver = new BroadcastChannel(name);
  const second = new BroadcastChannel(name);
  const dropped = new BroadcastChannel(name);
  t.add_cleanup(() => { sender.close(); receiver.close(); second.close(); dropped.close(); });
  const source = new SharedArrayBuffer(4);
  const result = new Promise((resolve, reject) => {
    receiver.onmessage = e => resolve(e.data);
    receiver.onmessageerror = reject;
  });
  const secondResult = new Promise((resolve, reject) => {
    second.onmessage = e => resolve(e.data);
    second.onmessageerror = reject;
  });
  sender.postMessage(source);
  dropped.close();
  const clone = await result;
  const secondClone = await secondResult;
  new Int32Array(clone)[0] = 41;
  assert_equals(new Int32Array(source)[0], 41);
  assert_equals(new Int32Array(secondClone)[0], 41);
}, 'BroadcastChannel retains shared backing memory for each recipient');

if (typeof document !== 'undefined') {
  promise_test(async t => {
    const source = new SharedArrayBuffer(4);
    const received = new Promise(resolve => {
      const listener = event => {
        if (event.data && event.data.bf1SharedWindow) {
          removeEventListener('message', listener);
          resolve(event.data.source);
        }
      };
      addEventListener('message', listener);
      t.add_cleanup(() => removeEventListener('message', listener));
    });
    postMessage({bf1SharedWindow: true, source}, '*');
    const clone = await received;
    new Int32Array(clone)[0] = 43;
    assert_equals(new Int32Array(source)[0], 43);
  }, 'Window postMessage keeps shared backing memory until delivery');
}
