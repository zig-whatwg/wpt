// META: title=Three noopener popups each keep their page in the back/forward cache at once: history.back() in each shows it again, pageshow persisted
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js
// META: script=/html/browsers/browsing-the-web/back-forward-cache/resources/rc-helper.js

// Lane nav2 batch 6 (the fetch/fetch-later/send-on-deactivate.https.window.js
// flake): that file runs three BFCache subtests in parallel, each in its own
// noopener popup, so up to six pages (three rc1 pages, then their rc2 pages)
// are in a Browser's back/forward cache at once. Chrome keeps up to 6 pages
// per tab (BackForwardCacheImpl, kBackForwardCacheSize "cache_size" 6, one
// cache per WebContents) and Firefox up to 8 in all (nsSHistory
// CalcMaxTotalViewers, browser.sessionhistory.max_total_viewers), so in both
// each popup's page is restored. This file does the same sequentially, so the
// result does not depend on how the parallel subtests interleave: three pages
// kept, then each popup goes back.
'use strict';

promise_test(async t => {
  const helper = new RemoteContextHelper();
  const popups = [];
  for (let i = 0; i < 3; i++) {
    const rc1 = await helper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
    await rc1.executeScript(i => {
      window.popupIndex = i;
      addEventListener('pageshow', e => { window.pageshowEvent = e; });
    }, [i]);
    const rc2 = await rc1.navigateToNew();
    popups.push({rc1, rc2});
  }
  // Every popup's first page is in the cache now; each goes back in turn.
  for (const {rc2} of popups) await rc2.historyBack();
  for (let i = 0; i < popups.length; i++) {
    const [index, persisted] = await popups[i].rc1.executeScript(() => [
      window.popupIndex,
      window.pageshowEvent === undefined ? 'no pageshow (a new document)' : window.pageshowEvent.persisted,
    ]);
    assert_equals(persisted, true, `popup ${i}: its page was restored from the back/forward cache`);
    assert_equals(index, i, `popup ${i}: the restored page is its own`);
  }
}, 'three popups each restore their page from the back/forward cache');
