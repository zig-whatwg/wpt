// META: global=sharedworker

test(() => {
  assert_true(self instanceof SharedWorkerGlobalScope);
  assert_equals(typeof importScripts, 'function');
}, 'The classic SharedWorker harness runs in its requested global');

async_test(t => {
  addEventListener('connect', t.step_func_done(event => {
    assert_equals(event.ports.length, 1);
    assert_equals(event.source, event.ports[0]);
  }), {once: true});
}, 'The classic SharedWorker harness receives its connection port');
