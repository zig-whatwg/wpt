// META: title=A Web Lock held by a page the back/forward cache keeps - by its document, its dedicated worker or its shared worker - is granted at once to an ifAvailable request from another page, and the cached page is evicted, never restored
// META: timeout=long
// META: variant=?context=document
// META: variant=?context=worker
// META: variant=?context=shared-worker
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane locks1. Chrome keeps a page that holds a Web Lock in the back/forward
// cache, and when another context contends for the lock it evicts the page
// and breaks its lock at once (Chromium 91c1404bed7e and c699bd7e6414), so an
// ifAvailable request gets the lock. Firefox never caches such a page - its
// unload released the lock - and Safari releases the locks as it caches the
// page (WebKit WebLockManager::suspend): in all three the request gets the
// lock. web-locks/bfcache/contention.https.window.js checks only that the
// page is not restored; this checks the lock too.
'use strict';

const context = new URLSearchParams(location.search).get('context');

promise_test(async t => {
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  const name = 'locks1-' + token();
  await rc1.executeScript(async (context, name) => {
    if (context === 'document') {
      await new Promise(resolve => {
        navigator.locks.request(name, () => { resolve(); return new Promise(() => {}); });
      });
      return;
    }
    const worker = context === 'worker' ?
        new Worker('/web-locks/resources/worker.js') :
        new SharedWorker('/web-locks/resources/worker.js');
    const port = context === 'worker' ? worker : worker.port;
    window.lockWorker = worker;
    const answer = await new Promise(resolve => {
      port.onmessage = e => resolve(e.data);
      port.postMessage({op: 'request', name, rqid: 1});
    });
    if (answer.ack !== 'request' || answer.lock_id === undefined) throw new Error('no lock: ' + JSON.stringify(answer));
  }, [context, name]);
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  const got = await rc2.executeScript(name => {
    return navigator.locks.request(name, {ifAvailable: true}, lock => lock ? 'lock' : 'null');
  }, [name]);
  assert_equals(got, 'lock', 'the ifAvailable request gets the lock the cached page held');
  await rc2.historyBack();
  await assertNotRestoredFromBFCache(rc1);
}, `An ifAvailable request for a lock held by a cached page's ${context} gets it, and the page is not restored`);
