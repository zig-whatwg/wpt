// META: title=A page the back/forward cache keeps has its dedicated worker, and the worker that one owns, suspended while it is cached and resumed when it is shown again; nothing the worker posted reaches the page while it is cached
// META: timeout=long
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane nav4b2. HTML 10.2.3: a worker whose owners are Documents none of which
// is fully active - the back/forward cache keeps its page - is not actively
// needed, and neither is a worker it owns; both are still permissible (their
// owner sets are not empty), so they are suspendable, and "run a worker" step
// 8 suspends their script until they are not. Chrome freezes a cached page's
// dedicated workers (DedicatedWorker::ContextLifecycleStateChanged), and
// Chrome, Firefox and Safari restore a page with a dedicated worker
// (back-forward-cache/eligibility/dedicated-worker.html passes in all three).
// The worker's timer ticks every 20 ms; a suspended worker's longest gap
// between two ticks is as long as its page stayed cached. Its ticks are
// posted to the page: the port message queue's tasks are the page's, so one
// posted just before the suspension took hold waits until the page is shown.
'use strict';

promise_test(async t => {
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(async () => {
    window.hiddenNow = false;
    window.messagesWhileHidden = 0;
    window.tickMessages = 0;
    addEventListener('pagehide', () => { window.hiddenNow = true; });
    addEventListener('pageshow', () => { window.hiddenNow = false; });
    window.worker = new Worker('/crane/resources/nav4b2-ticking-worker.js?post');
    worker.addEventListener('message', e => {
      if (!e.data || !e.data.tick) return;
      window.tickMessages++;
      if (window.hiddenNow) window.messagesWhileHidden++;
    });
    window.ask = data => new Promise(resolve => {
      const id = Math.random();
      const listener = e => {
        if (e.data && e.data.id === id) {
          worker.removeEventListener('message', listener);
          resolve(e.data);
        }
      };
      worker.addEventListener('message', listener);
      worker.postMessage({...data, id});
    });
    await ask({op: 'nest'});
    await ask({op: 'reset'});
  });
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  // Cached for a second.
  await new Promise(resolve => t.step_timeout(resolve, 1000));
  await rc2.historyBack();
  assert_true(await getBeforeBFCache(rc1), 'the page was restored from the back/forward cache');

  const [outer, inner, whileHidden] = await rc1.executeScript(async () => [
    await ask({op: 'stats'}),
    await ask({op: 'nested-stats'}),
    window.messagesWhileHidden,
  ]);
  assert_greater_than_equal(outer.maxGap, 800, 'the worker ran nothing while its page was cached');
  assert_greater_than_equal(inner.maxGap, 800, 'the worker it owns ran nothing either');
  assert_equals(whileHidden, 0, 'no message of the worker reached the page while it was cached');

  // Resumed: both tick again.
  const [outerAfter, innerAfter, messagesAfter] = await rc1.executeScript(async () => {
    const before = window.tickMessages;
    await new Promise(resolve => setTimeout(resolve, 300));
    return [await ask({op: 'stats'}), await ask({op: 'nested-stats'}), window.tickMessages - before];
  });
  assert_greater_than(outerAfter.ticks, outer.ticks, 'the worker ticks again once its page is shown');
  assert_greater_than(innerAfter.ticks, inner.ticks, 'so does the worker it owns');
  assert_greater_than(messagesAfter, 0, 'its messages reach the page again');
}, 'a cached page\'s dedicated workers are suspended with it and resumed with it');
