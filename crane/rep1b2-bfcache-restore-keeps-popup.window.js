// META: title=A popup outlives a back/forward traversal that restores a cached page in its opener's navigable
// META: timeout=long
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane rep1 batch 2: page A of a noopener popup is kept in the back/forward
// cache; its next page B opens a popup Q; history.back() restores A, and B -
// whose browsing context group holds Q, so it is not cached itself - is
// destroyed. Q is a top-level traversable of the user agent (HTML 7.3.1.2):
// the traversal that destroys B's document does not end it. Chrome 157 and
// Firefox 159 keep a popup running when the window that opened it goes
// (tmp/probes/rep1-popup-owner, the closed-opener and removed-iframe cases).
'use strict';

promise_test(async t => {
  const helper = new RemoteContextHelper();
  const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  await rc1.executeScript(() => {
    addEventListener('pageshow', e => { window.pageshowEvent = e; });
  });
  const rc2 = await rc1.navigateToNew();
  const popup = await rc2.addWindow();
  t.add_cleanup(() => popup.executeScript(() => close()).catch(() => {}));

  // Heartbeats on a BroadcastChannel, which needs no network.
  const name = token();
  const channel = new BroadcastChannel(name);
  t.add_cleanup(() => channel.close());
  const beats = [];
  channel.onmessage = e => beats.push(e.data);
  await popup.executeScript(name => {
    let n = 0;
    const c = new BroadcastChannel(name);
    setInterval(() => c.postMessage(++n), 100);
  }, [name]);

  await rc2.historyBack();
  const persisted = await rc1.executeScript(() =>
      window.pageshowEvent === undefined ? 'no pageshow (a new document)' : window.pageshowEvent.persisted);
  assert_equals(persisted, true, 'page A came back from the back/forward cache (the case under test)');

  const before = beats.length;
  await new Promise(resolve => t.step_timeout(resolve, 600));
  assert_greater_than(beats.length, before, "the popup's timers still run after the traversal");
  assert_equals(await popup.executeScript(() => 'answers'), 'answers', 'the popup still answers');
}, 'a popup opened by a page outlives the traversal that restores the cached page before it');
