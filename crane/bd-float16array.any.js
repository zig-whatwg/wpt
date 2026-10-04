// META: global=window,dedicatedworker
// META: title=Float16Array is on the global
//
// ES2025: Float16Array, Math.f16round and DataView's getFloat16/setFloat16.
// The V8 Crane links has them behind --js-float16array; WebIDL's
// (Float16Array or ...) arms - ImageDataArray's - need the constructor.

test(() => {
  assert_equals(typeof Float16Array, "function");
  assert_equals(Float16Array.BYTES_PER_ELEMENT, 2);
  const a = new Float16Array([1.5, 65504, 1e-8]);
  assert_equals(a[0], 1.5);
  assert_equals(a[1], 65504);
  assert_equals(a.byteLength, 6);
  assert_true(ArrayBuffer.isView(a));
}, "Float16Array");

test(() => {
  assert_equals(Math.f16round(1.337), 1.3369140625);
  const view = new DataView(new ArrayBuffer(2));
  view.setFloat16(0, 2.5);
  assert_equals(view.getFloat16(0), 2.5);
}, "Math.f16round and DataView float16 accessors");
