// META: title=A page that holds a Web Lock is not kept in the back/forward cache, with the reason "lock"
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane bfcache-b. HTML's unloading document cleanup steps: Web Locks makes a
// document holding a lock unsalvageable with "lock"; Crane records it before
// pagehide, so pagehide reports persisted false.
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  const rc1 = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript((name) => {
    navigator.locks.request(name, () => new Promise(() => {}));
    window.persisted = [];
    addEventListener('pagehide', e => localStorage.setItem('bfb-lock-pagehide', String(e.persisted)));
  }, [token()]);
  await assertBFCacheEligibility(rc1, /*shouldRestoreFromBFCache=*/ false);
  assert_equals(await rc1.executeScript(() => localStorage.getItem('bfb-lock-pagehide')), 'false');
});
