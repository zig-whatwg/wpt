// META: title=A page that holds a Web Lock is kept in the back/forward cache, and its pagehide says so (persisted true)
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane locks1 (replaces lane bfcache-b's bfb-lock-not-cached, which pinned the
// spec text's "lock" reason - Firefox's behaviour). Chrome and Safari keep a
// page whose document holds a Web Lock (web-locks/bfcache/
// held.tentative.https.html: Chrome 4/4, Firefox 0/4, Safari 4/4 on wpt.fyi
// stable, 2026-11-16), so its pagehide reports persisted true; Crane follows
// them (golden rule 2), and evicts the page when another context contends
// for its lock (Chrome's model).
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  const rc1 = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript((name) => {
    navigator.locks.request(name, () => new Promise(() => {}));
    addEventListener('pagehide', e => localStorage.setItem('bfb-lock-pagehide', String(e.persisted)));
  }, [token()]);
  await assertBFCacheEligibility(rc1, /*shouldRestoreFromBFCache=*/ true);
  assert_equals(await rc1.executeScript(() => localStorage.getItem('bfb-lock-pagehide')), 'true');
});
