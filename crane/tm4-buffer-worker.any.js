// META: global=dedicatedworker,sharedworker
// META: title=Resource buffer delivery in a global without a Document

promise_test(async t => {
  performance.clearResourceTimings();
  performance.setResourceTimingBufferSize(0);
  t.add_cleanup(() => {
    performance.onresourcetimingbufferfull = null;
    performance.setResourceTimingBufferSize(250);
  });
  let events = 0;
  const delivered = new Promise(resolve => {
    performance.onresourcetimingbufferfull = () => {
      ++events;
      performance.setResourceTimingBufferSize(10);
      resolve();
    };
  });
  const url = new URL('/resource-timing/resources/empty_script.js?tm4-worker', location.href).href;
  const response = await fetch(url);
  assert_equals(response.status, 200);
  await response.arrayBuffer();
  await delivered;
  assert_equals(events, 1);
  assert_equals(performance.getEntriesByName(url, 'resource').length, 1);
}, 'A worker buffer event runs without a Window document-activity classification');
