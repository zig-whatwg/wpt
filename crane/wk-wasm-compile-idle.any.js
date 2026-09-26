// META: global=dedicatedworker
// META: title=A worker with no task of its own still runs V8's posted tasks
//
// WebAssembly.compile() compiles on a background thread, and V8 settles its
// promise from a foreground task it posts to the platform for the worker's
// isolate. A worker that has nothing else to do - no timer due, no message
// arriving - must still run that task: d8 keeps its message loop waiting while
// the isolate has background work pending (Shell::CompleteMessageLoop).

// (module (func (export "inc") (param i32) (result i32)
//   local.get 0 i32.const 1 i32.add))
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x06, 0x01, 0x60,
  0x01, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03,
  0x69, 0x6e, 0x63, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00,
  0x41, 0x01, 0x6a, 0x0b]);

promise_test(async () => {
  const module = await WebAssembly.compile(bytes);
  assert_true(module instanceof WebAssembly.Module);
  const { instance } = await WebAssembly.instantiate(bytes);
  assert_equals(instance.exports.inc(41), 42);
}, "an asynchronous WebAssembly compile settles in an otherwise idle worker");
