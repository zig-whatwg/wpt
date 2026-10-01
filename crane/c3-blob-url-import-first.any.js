// META: global=window,dedicatedworker
// META: title=import() of a blob URL works before anything has called fetch()
//
// Scheme fetch "blob" obtains the blob from the blob URL store. Crane's fetch
// reaches the store through a resolver the File API side installs, and only
// fetch() and XMLHttpRequest's send() installed it - so a module fetch of a
// blob URL was a network error in a process that had not run either yet, and
// succeeded after one had. html/semantics/scripting-1/the-script-element/
// module/dynamic-import/blob-url.any.js passed 4 of 24 alone and 20 of 24
// after other files in a sweep. Nothing in this file calls fetch() or XHR:
// run it alone.

promise_test(async t => {
  const url = URL.createObjectURL(new Blob(['export const answer = 42;'], { type: "text/javascript" }));
  t.add_cleanup(() => URL.revokeObjectURL(url));
  const module = await import(url);
  assert_equals(module.answer, 42);
}, "import() of a blob URL, with no fetch() before it");

promise_test(async t => {
  const blob = new Blob(['export default "twice";'], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  t.add_cleanup(() => URL.revokeObjectURL(url));
  const first = await import(url);
  const second = await import(url);
  assert_equals(first.default, "twice");
  assert_equals(first, second, "one module map entry for one URL");
}, "two import()s of one blob URL load one module");
