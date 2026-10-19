// META: title=A timer of a page in the back/forward cache waits while the page is cached, and fires after the restore
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane bfcache-b. HTML "unload a document" steps 15-16 and "reactivate" step
// 2: the timer's wait is shifted by the time the page was suspended. Firefox
// and Safari pause timers in the cache (html/browsers/browsing-the-web/
// back-forward-cache/timers.html passes in both, wpt.fyi 23b0b89b1a); Chrome
// fires them early.
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  const rc1 = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(() => {
    window.fired = false;
    setTimeout(() => { window.fired = true; }, 1000);
  });
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  // Cached for longer than the timer's wait.
  await new Promise(resolve => t.step_timeout(resolve, 1500));
  await rc2.historyBack();
  await assertImplementsBFCacheOptional(rc1);
  assert_false(await rc1.executeScript(() => window.fired), 'the timer did not fire while the page was cached');
  await rc1.executeScript(() => new Promise(resolve => {
    const check = () => window.fired ? resolve() : setTimeout(check, 50);
    check();
  }));
});
