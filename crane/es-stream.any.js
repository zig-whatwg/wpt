// META: title=EventSource incremental stream and trusted messages
// META: global=window,dedicatedworker

async_test(t => {
  const source = new EventSource('/eventsource/resources/message2.py');
  t.add_cleanup(() => source.close());
  let opened = false;
  source.onopen = t.step_func(e => {
    opened = true;
    assert_true(e.isTrusted);
    assert_equals(source.readyState, EventSource.OPEN);
  });
  source.onerror = t.unreached_func('Streaming connection must succeed');
  source.onmessage = t.step_func_done(e => {
    source.close();
    assert_true(opened, 'open precedes message');
    assert_equals(e.constructor, MessageEvent);
    assert_true(e.isTrusted);
    assert_equals(e.data, 'msg\nmsg');
    assert_equals(e.origin, location.origin);
    assert_equals(e.lastEventId, '');
    assert_equals(e.source, null);
    assert_array_equals(e.ports, []);
    assert_false(e.bubbles);
    assert_false(e.cancelable);
  });
}, 'A live response delivers its first message without waiting for EOF');

async_test(t => {
  const stream = '\uFEFFid: α\r\nevent: named\r\ndata: first\rdata: second\n\n';
  const source = new EventSource('/eventsource/resources/message.py?message=' + encodeURIComponent(stream));
  t.add_cleanup(() => source.close());
  source.onmessage = t.unreached_func('Named event must not become message');
  source.addEventListener('named', t.step_func_done(e => {
    source.close();
    assert_equals(e.data, 'first\nsecond');
    assert_equals(e.lastEventId, 'α');
    assert_true(e.isTrusted);
  }));
}, 'BOM, mixed line endings, event name and lastEventId reach script');

async_test(t => {
  const source = new EventSource('/eventsource/resources/message.py?mime=text/plain');
  t.add_cleanup(() => source.close());
  source.onopen = t.unreached_func('Wrong MIME type must not open');
  source.onmessage = t.unreached_func('Wrong MIME type must not dispatch data');
  source.onerror = t.step_func_done(e => {
    assert_equals(source.readyState, EventSource.CLOSED);
    assert_true(e.isTrusted);
  });
}, 'An invalid MIME type fails the connection with CLOSED and a trusted error');
