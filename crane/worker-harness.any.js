// META: global=window,dedicatedworker
//
// The minimum a `.any.js` test needs from a worker, and nothing else.
//
// This exists to isolate the harness plumbing from the APIs under test. When a
// real worker test fails there are two candidate explanations - the feature is
// missing, or the worker never reported back - and this file eliminates the
// second. It asserts only things that are true in every context, so a failure
// here is always the plumbing:
//
//   1. wpt serve generated the `.any.worker.js` wrapper and we fetched it
//   2. importScripts() pulled testharness.js into the worker
//   3. the worker ran the test bodies
//   4. fetch_tests_from_worker() carried the results back to the window
//
// Run it with:
//   zig build wpt -- crane/worker-harness.any.js

test(() => {
  assert_true(typeof self !== "undefined", "self is defined");
  assert_equals(self, self.self, "self is its own global");
}, "self refers to the global object");

test(() => {
  // The wrapper defines GLOBAL before importing testharness.js. If it is
  // missing, the generated wrapper never ran and everything after it is noise.
  assert_equals(typeof GLOBAL, "object", "GLOBAL shim exists");
  assert_equals(typeof GLOBAL.isWindow, "function", "GLOBAL.isWindow exists");
  assert_equals(typeof GLOBAL.isWorker, "function", "GLOBAL.isWorker exists");
  assert_true(
    GLOBAL.isWindow() !== GLOBAL.isWorker(),
    "exactly one of isWindow/isWorker is true",
  );
}, "the GLOBAL shim describes the context");

test(() => {
  // Distinguishes "ran in the worker" from "silently fell back to the window",
  // which would otherwise look identical in the results.
  if (GLOBAL.isWorker()) {
    assert_equals(typeof WorkerGlobalScope, "function", "WorkerGlobalScope exists");
    assert_true(self instanceof WorkerGlobalScope, "self is a WorkerGlobalScope");
    assert_equals(typeof importScripts, "function", "importScripts exists");
    assert_equals(typeof window, "undefined", "window is absent in a worker");
  } else {
    assert_equals(typeof window, "object", "window exists");
    assert_equals(self, window, "self is window");
  }
}, "the context is the one the wrapper claims");

test(() => {
  // testharness.js picks its environment in create_test_environment() by
  // checking, in order: `'document' in global_scope`, then instanceof against
  // DedicatedWorkerGlobalScope / WorkerGlobalScope. Fall off the end of that
  // chain and you get a ShellTestEnvironment, which never posts results back -
  // so the test does not fail, it hangs until the harness times out. These
  // assertions are that dispatch table, checked directly.
  if (GLOBAL.isWorker()) {
    assert_false("document" in self, "a worker global must not expose document");
    const dedicated =
      "DedicatedWorkerGlobalScope" in self && self instanceof DedicatedWorkerGlobalScope;
    const generic = "WorkerGlobalScope" in self && self instanceof WorkerGlobalScope;
    assert_true(
      dedicated || generic,
      "the global matches one of the branches that yields a worker environment",
    );
  } else {
    assert_true("document" in self, "a window global exposes document");
  }
}, "testharness picks a reporting environment for this global");

async_test((t) => {
  // Async completion has to survive the trip back as well: a harness that only
  // ever reports synchronous results would pass every test above and still
  // strand every real worker test, which almost all of them are.
  t.step_timeout(() => {
    t.done();
  }, 0);
}, "async results survive the round trip");

promise_test(async () => {
  const value = await Promise.resolve(42);
  assert_equals(value, 42, "promise resolved");
}, "promise results survive the round trip");
