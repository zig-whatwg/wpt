// META: global=window,worker
// META: title=Stream upload authentication rejection in every global

promise_test(async t => {
  const body = new ReadableStream({ start(controller) { controller.close(); } });
  await promise_rejects_js(t, TypeError, fetch(
    '/fetch/api/resources/authentication.py?realm=fa3-isolated',
    { method: 'POST', body, duplex: 'half' }
  ));
}, 'An authentication challenge rejects a streamed upload even without a prompt window');
