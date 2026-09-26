// META: global=dedicatedworker
// META: title=fetch() in a worker runs in parallel
//
// fetch() step 12 fetches "in parallel" and settles p from a task queued when
// the response arrives, in a worker as in a window. The call returns p at once,
// and the worker keeps running its tasks while the request is in flight.
// /common/slow.py holds its response for `delay` milliseconds.
const slow = ms => `/common/slow.py?delay=${ms}`;

promise_test(async () => {
  const started = Date.now();
  const p = fetch(slow(1000));
  assert_less_than(Date.now() - started, 500, "fetch() returned before its response arrived");
  const response = await p;
  assert_equals(response.status, 200);
}, "fetch() returns before the network has answered");

promise_test(async () => {
  let fired = false;
  setTimeout(() => { fired = true; }, 50);
  await fetch(slow(500));
  assert_true(fired, "a timer that came due while the fetch was in flight has run");
}, "a worker timer runs while a fetch is in flight");

promise_test(async () => {
  // The worker's URL is /crane/wk-fetch-async.any.worker.js.
  const response = await fetch("../common/text-plain.txt");
  assert_true(response instanceof Response, "the response is a Response of this realm");
  assert_equals(new URL(response.url).pathname, "/common/text-plain.txt");
  const text = await response.text();
  assert_greater_than(text.length, 0);
}, "a relative URL resolves against the worker's URL");

promise_test(async t => {
  await promise_rejects_js(t, TypeError, fetch("http://127.0.0.1:1/bad-port"));
}, "a blocked port rejects with a TypeError");
