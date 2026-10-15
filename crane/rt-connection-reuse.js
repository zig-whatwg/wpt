// Like the upstream connection-reuse tests, use one synchronous XHR to
// pre-establish the connection, then inspect only subsequent requests.
for (const redirected of [false, true]) {
  promise_test(async t => {
    const xhr = new XMLHttpRequest();
    const entries = [];
    let resolveEntries;
    const received = new Promise(resolve => resolveEntries = resolve);
    const token = `rt-reuse-${redirected}-${Math.random()}`;
    const observer = new PerformanceObserver(list => {
      entries.push(...list.getEntries().filter(e => e.name.includes(token)));
      if (entries.length === 12) resolveEntries();
    });
    t.add_cleanup(() => observer.disconnect());
    const resource = new URL('/resource-timing/resources/fake_responses.py', location.href);
    const targetFor = url => redirected
      ? '/resource-timing/resources/fake_responses.py?redirect=' + encodeURIComponent(url)
      : url;
    xhr.open('GET', targetFor(resource.href + '?tag=' + token + '&warmup=1'), false);
    xhr.send();
    observer.observe({entryTypes: ['resource']});
    for (let i = 0; i < 12; ++i) {
      resource.search = `?tag=${token}&iteration=${i}`;
      const target = targetFor(resource.href);
      xhr.open('GET', target, false);
      xhr.send();
      assert_equals(xhr.status, 200);
    }
    await received;
    for (const entry of entries) {
      for (const field of ['domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd']) {
        assert_equals(entry[field], entry.fetchStart, `${field} copies fetchStart: ${entry.name}`);
      }
      assert_equals(entry.secureConnectionStart,
        location.protocol === 'https:' ? entry.fetchStart : 0,
        'TLS start uses the same fetch timestamp only for secure transport');
      assert_greater_than_equal(entry.requestStart, entry.connectEnd);
      assert_greater_than_equal(entry.responseEnd, entry.requestStart);
    }
  }, `Repeated ${redirected ? 'redirected' : 'direct'} requests preserve exact connection timestamp equality`);
}
