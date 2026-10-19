// META: title=A BroadcastChannel message to a page in the back/forward cache evicts it: it is not restored, and its listener never runs
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane bfcache-b. HTML: a channel whose Document is not fully active is not
// eligible for messaging; Chromium evicts the page instead, with its reason
// "broadcastchannel-message" (BackForwardCacheImpl), which Crane follows.
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  const rc1 = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  const channelName = token();
  await rc1.executeScript((name) => {
    window.heard = 0;
    window.channel = new BroadcastChannel(name);
    window.channel.onmessage = () => { window.heard++; localStorage.setItem('bfb-heard-' + name, '1'); };
  }, [channelName]);
  await prepareForBFCache(rc1);
  const rc2 = await rc1.navigateToNew();
  await rc2.executeScript((name) => {
    const channel = new BroadcastChannel(name);
    channel.postMessage('hello');
    channel.close();
  }, [channelName]);
  // Let the delivery reach the cached page.
  await new Promise(resolve => t.step_timeout(resolve, 300));
  await rc2.historyBack();
  // Evicted: loaded again, so the flag set before the navigation is gone.
  assert_not_equals(await getBeforeBFCache(rc1), true, 'the page was not restored from the cache');
  assert_equals(await rc1.executeScript((name) => localStorage.getItem('bfb-heard-' + name), [channelName]), null,
      'the cached page\'s listener never ran');
});
