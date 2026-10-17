// META: global=window,dedicatedworker
// META: title=Constructors and operations whose dictionary argument has a callback member, many times
//
// Crane's binding kept two engine handles per `new WritableStream({}, {highWaterMark: 0})`:
// the strategy argument's own, because its QueuingStrategy has a callback member (`size`),
// and the one made for its absent `size` member. ReadableStream's and TransformStream's
// strategies took the same path, and so did an optional callback argument given null
// (addEventListener(type, null)). This file makes each of them N times, in a window and in
// a dedicated worker, so that leaks --atExit over it counts what each call leaves.

const N = 200;

test(() => {
  for (let i = 0; i < N; i++) {
    new WritableStream({}, {highWaterMark: 0});
    new WritableStream({}, {});
    new WritableStream({}, {size: () => 1});
  }
  const ws = new WritableStream({}, {highWaterMark: 4, size: () => 2});
  assert_equals(ws.getWriter().desiredSize, 4, 'the strategy still applies');
}, `${N} WritableStreams with a queuing strategy`);

test(() => {
  for (let i = 0; i < N; i++) {
    new ReadableStream({}, {highWaterMark: 0});
    new ReadableStream({}, {size: () => 1});
  }
  let controller;
  new ReadableStream({ start(c) { controller = c; } }, {highWaterMark: 3, size: () => 1});
  assert_equals(controller.desiredSize, 3, 'the strategy still applies');
}, `${N} ReadableStreams with a queuing strategy`);

test(() => {
  for (let i = 0; i < N; i++) {
    new TransformStream({}, {highWaterMark: 0}, {highWaterMark: 0});
  }
  const ts = new TransformStream({}, {highWaterMark: 2}, {highWaterMark: 0});
  assert_equals(ts.writable.getWriter().desiredSize, 2, 'the writable strategy still applies');
}, `${N} TransformStreams with queuing strategies`);

test(() => {
  const target = new EventTarget();
  for (let i = 0; i < N; i++) {
    target.addEventListener('x', null);
    target.removeEventListener('x', null);
  }
  let fired = 0;
  target.addEventListener('x', () => { fired++; });
  target.dispatchEvent(new Event('x'));
  assert_equals(fired, 1, 'a listener added after the null ones still fires');
}, `${N} addEventListener / removeEventListener calls with a null callback`);
