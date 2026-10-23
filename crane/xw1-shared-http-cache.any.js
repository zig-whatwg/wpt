// META: global=window,dedicatedworker,sharedworker
// META: script=/common/utils.js
// META: title=Workers use their creator's partitioned HTTP cache

promise_test(async t => {
  const url = '/resource-timing/resources/cacheable-and-validated.py?content=xw1&miss=' + token();
  await promise_rejects_js(t, TypeError,
    fetch(url, {mode: 'same-origin', cache: 'only-if-cached'}));
}, 'only-if-cached rejects a miss without going to the network');

promise_test(async () => {
  const url = new URL('/resource-timing/resources/cacheable-and-validated.py?content=xw1&hit=' + token(), location.href).href;
  assert_equals(await (await fetch(url)).text(), 'xw1');
  performance.clearResourceTimings();
  assert_equals(await (await fetch(url, {mode: 'same-origin', cache: 'only-if-cached'})).text(), 'xw1');
  const entry = await new Promise(resolve => {
    const observer = new PerformanceObserver(list => {
      const found = list.getEntriesByName(url)[0];
      if (found) { observer.disconnect(); resolve(found); }
    });
    observer.observe({type: 'resource', buffered: true});
  });
  assert_equals(entry.transferSize, 0, 'the second response is a cache hit');
}, 'only-if-cached uses a previously stored response');

promise_test(async () => {
  const url = '/fetch/api/resources/cache.py?v=' + token();
  const first = await fetch(url);
  assert_equals(first.headers.get('X-HTTP-STATUS'), null);
  await first.text();
  const second = await fetch(url);
  assert_equals(second.status, 200);
  assert_equals(second.headers.get('X-HTTP-STATUS'), '304');
  await second.text();
}, 'a cached ETag is sent when a worker revalidates its response');
