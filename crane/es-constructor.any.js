// META: title=EventSource constructor state, URL and event handlers
// META: global=window,dedicatedworker

test(t => {
  const source = new EventSource('/eventsource/resources/message.py?message=data%3Ahello');
  t.add_cleanup(() => source.close());
  assert_equals(source.readyState, EventSource.CONNECTING);
  assert_equals(source.url, new URL('/eventsource/resources/message.py?message=data%3Ahello', location.href).href);
  assert_false(source.withCredentials);
  assert_equals(source.onopen, null);
  assert_equals(source.onmessage, null);
  assert_equals(source.onerror, null);
}, 'Constructor exposes initial state and resolves URL in its relevant realm');

test(t => {
  const source = new EventSource('/eventsource/resources/message.py', {withCredentials: true});
  t.add_cleanup(() => source.close());
  assert_true(source.withCredentials);
  const handler = () => {};
  for (const name of ['onopen', 'onmessage', 'onerror']) {
    source[name] = handler;
    assert_equals(source[name], handler);
    source[name] = null;
    assert_equals(source[name], null);
  }
}, 'Credentials and event handler IDL attributes retain their assigned values');

test(t => {
  const source = new EventSource('/eventsource/resources/message.py?sleep=200');
  t.add_cleanup(() => source.close());
  source.close();
  assert_equals(source.readyState, EventSource.CLOSED);
  source.close();
  assert_equals(source.readyState, EventSource.CLOSED);
}, 'close immediately enters CLOSED and is idempotent');

test(() => {
  assert_throws_dom('SyntaxError', () => new EventSource('http://['));
}, 'A malformed URL throws SyntaxError');
