// META: global=window,worker

test(t => {
  const socket = new WebSocket('ws://127.0.0.1:9/', ['echo', 'ECHO']);
  t.add_cleanup(() => socket.close());
  assert_equals(socket.readyState, WebSocket.CONNECTING);
}, 'Case-distinct protocols are accepted in each relevant realm');

test(t => {
  const socket = new WebSocket('ws://127.0.0.1:9/');
  t.add_cleanup(() => socket.close());
  socket.send({toString() { socket.close(); return 'converted'; }});
  assert_equals(socket.bufferedAmount, 9);
  socket.send(1e21);
  assert_equals(socket.bufferedAmount, 14);
}, 'send conversion and ECMAScript numbers work in each relevant realm');

test(() => {
  const sentinel = {};
  assert_throws_exactly(sentinel, () => new WebSocket('ftp://example.test/', {
    toString() { throw sentinel; }
  }));
}, 'Constructor preserves conversion exceptions in each relevant realm');
