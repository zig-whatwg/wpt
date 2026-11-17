// META: title=A shared worker whose owners are all in the back/forward cache is suspended until one is shown again; one with another page showing keeps running
// META: timeout=long
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane nav4b2. HTML 10.2.3: a shared worker is actively needed while a
// Document of its owner set is fully active; a Document the back/forward
// cache keeps stays in the owner set but is not fully active, so a worker
// whose owners are all cached is suspendable - suspended by "run a worker"
// step 8 until an owner is fully active again - and one with another owner
// showing is not. Chrome freezes a shared worker with no active client and
// resumes it when one is (SharedWorkerHost::OnClientStateChanged,
// kFreezeSharedWorker), Firefox freezes it when every client is frozen
// (SharedWorkerManager::UpdateFrozen); back-forward-cache/eligibility/
// shared-worker.html and shared-worker-active-client.window.js pass in
// Chrome, Firefox and Safari. The worker's timer ticks every 20 ms; a
// suspended worker's longest gap between two ticks is as long as its owners
// stayed cached.
'use strict';

const workerUrl = '/crane/resources/nav4b2-ticking-worker.js';

// In an executor: connect to the shared worker named `name`, and keep a
// helper that asks it something. An arrow function: the executor evaluates
// its source as an expression.
const connect = async (url, name) => {
  window.worker = new SharedWorker(url, name);
  window.ask = data => new Promise(resolve => {
    const id = Math.random();
    const listener = e => {
      if (e.data && e.data.id === id) {
        worker.port.removeEventListener('message', listener);
        resolve(e.data);
      }
    };
    worker.port.addEventListener('message', listener);
    worker.port.start();
    worker.port.postMessage({...data, id});
  });
  await ask({op: 'reset'});
};

promise_test(async t => {
  const name = 'only-owner-' + token();
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(connect, [workerUrl, name]);
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  await new Promise(resolve => t.step_timeout(resolve, 1000));
  await rc2.historyBack();
  assert_true(await getBeforeBFCache(rc1), 'the page was restored from the back/forward cache');
  const stats = await rc1.executeScript(() => ask({op: 'stats'}));
  assert_greater_than_equal(stats.maxGap, 800, 'the worker ran nothing while its only owner was cached');
  const after = await rc1.executeScript(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return ask({op: 'stats'});
  });
  assert_greater_than(after.ticks, stats.ticks, 'the worker ticks again once its owner is shown');
}, 'a shared worker whose only owner is cached is suspended, and resumed when it is shown');

promise_test(async t => {
  const name = 'two-owners-' + token();
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  const other = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(connect, [workerUrl, name]);
  await other.executeScript(connect, [workerUrl, name]);
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  await new Promise(resolve => t.step_timeout(resolve, 1000));
  // The other owner, still shown, sees the worker tick throughout.
  const during = await other.executeScript(() => ask({op: 'stats'}));
  assert_less_than(during.maxGap, 800, 'the worker kept running while another owner was shown');
  await rc2.historyBack();
  assert_true(await getBeforeBFCache(rc1), 'the page was restored from the back/forward cache');
  const stats = await rc1.executeScript(() => ask({op: 'stats'}));
  assert_greater_than(stats.ticks, during.ticks - 1, 'the restored owner reaches the same worker');
}, 'a shared worker with another owner shown keeps running while one owner is cached');

promise_test(async t => {
  const name = 'message-while-cached-' + token();
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  const other = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(async (url, name) => {
    window.hiddenNow = false;
    window.broadcasts = [];
    window.broadcastsWhileHidden = 0;
    addEventListener('pagehide', () => { window.hiddenNow = true; });
    addEventListener('pageshow', () => { window.hiddenNow = false; });
    window.worker = new SharedWorker(url, name);
    worker.port.addEventListener('message', e => {
      if (!e.data || e.data.broadcast === undefined) return;
      window.broadcasts.push(e.data.broadcast);
      if (window.hiddenNow) window.broadcastsWhileHidden++;
    });
    worker.port.start();
  }, [workerUrl, name]);
  await other.executeScript(connect, [workerUrl, name]);
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  // The worker, kept running by the other owner, posts to every port - the
  // cached page's too, which must not hear it until it is shown again.
  await other.executeScript(() => ask({op: 'broadcast', value: 'while-cached'}));
  await new Promise(resolve => t.step_timeout(resolve, 300));
  await rc2.historyBack();
  assert_true(await getBeforeBFCache(rc1), 'the page was restored from the back/forward cache');
  const [broadcasts, whileHidden] = await rc1.executeScript(async () => {
    for (let i = 0; i < 50 && window.broadcasts.length === 0; i++) await new Promise(resolve => setTimeout(resolve, 20));
    return [window.broadcasts, window.broadcastsWhileHidden];
  });
  assert_equals(whileHidden, 0, 'nothing reached the page while it was cached');
  assert_array_equals(broadcasts, ['while-cached'], 'the message waited for the page to be shown');
}, 'a message a shared worker posts to a cached page waits until the page is shown again');
