// META: global=window,dedicatedworker
// META: title=A queuing strategy's size is its realm's one function; a byte stream given one releases it
//
// Crane's CountQueuingStrategy and ByteLengthQueuingStrategy `size` getters returned a native
// function the binding could not convert: script read undefined, and every read kept an engine
// handle. And `new ReadableStream({type: 'bytes'}, {size})`, which must throw a RangeError,
// dropped the size callback without releasing it. This file does each N times, in a window and
// in a dedicated worker, so that leaks --atExit over it counts what each leaves (lane leaks4).

const N = 200;

for (const [Strategy, length] of [[CountQueuingStrategy, 0], [ByteLengthQueuingStrategy, 1]]) {
  test(() => {
    const first = new Strategy({ highWaterMark: 1 }).size;
    for (let i = 0; i < N; i++) {
      assert_equals(new Strategy({ highWaterMark: i }).size, first, 'one function for every instance');
    }
    assert_equals(typeof first, 'function');
    assert_equals(first.name, 'size');
    assert_equals(first.length, length);
    assert_false('prototype' in first, 'not a constructor: no prototype');
    assert_throws_js(TypeError, () => new first({ byteLength: 1 }));
  }, `${Strategy.name}: ${N} reads of size answer the realm's one size function`);
}

test(() => {
  const count = new CountQueuingStrategy({ highWaterMark: 1 }).size;
  const bytes = new ByteLengthQueuingStrategy({ highWaterMark: 1 }).size;
  for (let i = 0; i < N; i++) {
    assert_equals(count(i), 1);
    assert_equals(bytes({ byteLength: i }), i);
  }
  assert_throws_js(TypeError, () => bytes(undefined));
  assert_equals(bytes('potato'), undefined);
}, `${N} calls of the size functions`);

test(() => {
  const size = () => 1;
  for (let i = 0; i < N; i++) {
    assert_throws_js(RangeError, () => new ReadableStream({ type: 'bytes' }, { size }));
  }
}, `${N} byte streams given a size function throw a RangeError`);

test(() => {
  const size = () => 1;
  for (let i = 0; i < N; i++) {
    assert_throws_js(TypeError, () => new ReadableStream(5, { size }));
  }
}, `${N} streams whose underlying source is not an object throw before they take the size function`);

test(() => {
  const strategy = new CountQueuingStrategy({ highWaterMark: 2 });
  const stream = new ReadableStream({}, strategy);
  let controller;
  new ReadableStream({ start(c) { controller = c; } }, strategy);
  assert_equals(controller.desiredSize, 2, 'a stream uses the strategy and its size');
  controller.enqueue('a');
  assert_equals(controller.desiredSize, 1, 'each chunk counts 1');
}, 'a stream made with a CountQueuingStrategy counts its chunks');
