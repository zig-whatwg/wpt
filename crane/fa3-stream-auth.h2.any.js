// META: global=window,worker
// META: title=Stream authentication challenge decisions

function streamBody() {
  return new ReadableStream({start(controller) {
    controller.enqueue(new TextEncoder().encode('fa3'));
    controller.close();
  }});
}

for (const options of [{}, {window: null}, {credentials: 'include'}]) {
  promise_test(async t => {
    await promise_rejects_js(t, TypeError, fetch(
      '/fetch/api/resources/authentication.py?realm=fa3-stream',
      {method: 'POST', body: streamBody(), duplex: 'half', ...options}
    ));
  }, 'Streamed authentication challenge rejects with ' + JSON.stringify(options));
}

promise_test(async () => {
  const response = await fetch('/fetch/api/resources/authentication.py?realm=fa3-omit', {
    method: 'POST', body: streamBody(), duplex: 'half', credentials: 'omit'
  });
  assert_equals(response.status, 401);
  assert_true((await response.text()).includes('Please login'));
}, 'Omitting credentials preserves the 401 response to a streamed body');

for (const body of [undefined, 'fa3']) {
  promise_test(async () => {
    const response = await fetch('/fetch/api/resources/authentication.py?realm=fa3-replayable', {
      method: 'POST', body
    });
    assert_equals(response.status, 401);
    assert_true((await response.text()).includes('Please login'));
  }, 'A replayable or absent body preserves the ordinary 401 response: ' + String(body));
}

promise_test(async () => {
  const response = await fetch('/fetch/api/resources/echo-content.h2.py', {
    method: 'POST', body: streamBody(), duplex: 'half'
  });
  assert_equals(await response.text(), 'fa3');
}, 'A successful stream upload remains readable');
