// META: title=A page whose document holds a Web Lock is kept in the back/forward cache with its lock, and restored still holding it
// META: timeout=long
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane locks1. Chrome and Safari keep a page whose document holds a Web Lock
// (web-locks/bfcache/held.tentative.https.html passes in both, Firefox keeps
// the page out). Chrome keeps the lock held while the page is cached and
// after it is restored (Chromium 91c1404bed7e); Safari releases it as it
// caches the page (WebKit WebLockManager::suspend). Crane follows Chrome:
// with nobody contending, the restored page still holds its lock, under the
// same clientId, and the lock's callback promise is still pending.
'use strict';

promise_test(async t => {
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  const name = 'locks1-' + token();
  const before = await rc1.executeScript(async name => {
    window.lockSettled = false;
    await new Promise(resolve => {
      navigator.locks.request(name, () => { resolve(); return new Promise(() => {}); })
          .then(() => { window.lockSettled = true; }, () => { window.lockSettled = true; });
    });
    const state = await navigator.locks.query();
    return state.held.filter(l => l.name === name).map(l => l.clientId);
  }, [name]);
  assert_equals(before.length, 1, 'the page holds its lock before it is left');
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  await rc2.historyBack();
  await assertImplementsBFCacheOptional(rc1);
  const [after, settled] = await rc1.executeScript(async name => {
    const state = await navigator.locks.query();
    return [state.held.filter(l => l.name === name).map(l => l.clientId), window.lockSettled];
  }, [name]);
  assert_array_equals(after, before, 'the restored page holds the same lock, under the same clientId');
  assert_false(settled, 'the lock was not released or stolen while the page was cached');
}, 'A page whose document holds a Web Lock is restored from the back/forward cache still holding it');
