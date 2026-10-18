// META: global=dedicatedworker,sharedworker
// META: title=Legacy navigation timing names cannot be resolved in workers

const names = [
  'navigationStart', 'unloadEventStart', 'unloadEventEnd', 'redirectStart',
  'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd',
  'connectStart', 'connectEnd', 'secureConnectionStart', 'requestStart',
  'responseStart', 'responseEnd', 'domLoading', 'domInteractive',
  'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete',
  'loadEventStart', 'loadEventEnd'
];

for (const name of names) {
  test(() => {
    assert_throws_js(TypeError, () => performance.measure('rt3-start', name));
    assert_throws_js(TypeError, () => performance.measure('rt3-end', {end: name}));
  }, 'Legacy timing name ' + name + ' throws in a worker');
}
