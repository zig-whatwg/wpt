// META: title=A noopener popup's page is kept when it navigates, and history.back() shows it again: its JS heap, pageshow persisted true, no second load
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane bfcache-b (Crane's back/forward cache, phase B). The page is cached by
// Chrome, Firefox and Safari alike: the upstream activation-after-bfcache and
// navigate-history-back-bfcache files pass in all three (wpt.fyi 23b0b89b1a).
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  const rc1 = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(() => {
    window.events = [];
    window.loads = (window.loads || 0) + 1;
    addEventListener('pagehide', e => events.push('pagehide:' + e.persisted));
    addEventListener('pageshow', e => events.push('pageshow:' + e.persisted));
    addEventListener('unload', () => events.push('unload'));
  });
  await assertBFCacheEligibility(rc1, /*shouldRestoreFromBFCache=*/ true);
  const [events, loads] = await rc1.executeScript(() => [window.events, window.loads]);
  assert_equals(loads, 1, 'the page was not loaded again');
  assert_array_equals(events, ['pagehide:true', 'pageshow:true'],
      'pagehide and pageshow persisted, no unload for a kept page');
});
