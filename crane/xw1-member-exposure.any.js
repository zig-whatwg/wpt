// META: global=window,worker

test(() => {
  assert_equals(typeof performance.now, 'function');
  if (typeof ServiceWorkerGlobalScope !== 'undefined')
    assert_equals(typeof XMLHttpRequest, 'undefined');
  else
    assert_true('responseType' in XMLHttpRequest.prototype);
}, 'Members without an Exposed override retain their interface exposure');

test(() => {
  assert_equals(typeof XMLHttpRequest !== 'undefined' &&
                'responseXML' in XMLHttpRequest.prototype,
                typeof Window !== 'undefined');
}, 'A member Exposed to Window is absent from worker prototypes');

test(() => {
  for (const name of ['timing', 'navigation']) {
    assert_equals(name in Performance.prototype, typeof Window !== 'undefined', name);
  }
}, 'Partial-interface exposure applies only to its own instance members');

test(() => {
  const expected = typeof ServiceWorkerGlobalScope === 'undefined';
  assert_equals('createObjectURL' in URL, expected);
  assert_equals('revokeObjectURL' in URL, expected);
  assert_equals(typeof URL.canParse, 'function');
}, 'FileAPI partial URL statics are absent from ServiceWorker globals');
