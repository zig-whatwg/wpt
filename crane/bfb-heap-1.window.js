// META: title=Retained heap with the back/forward cache: a popup navigated 1 time(s), one page kept
// META: script=/common/dispatcher/dispatcher.js
// META: script=/common/utils.js
// META: script=/html/browsers/browsing-the-web/remote-context-helper/resources/remote-context-helper.js

// Lane bfcache-b's memory pages: the runner's per-file retained heap
// (CRANE_HEAP_GC=1) and native_contexts, read at the file's end - before
// the next file's navigation evicts the cached pages - base against tip.
// Each page holds a 1 MB array, so a kept page is visible in the heap.
'use strict';

promise_test(async t => {
  const rcHelper = new RemoteContextHelper();
  let rc = await rcHelper.addWindow(/*config=*/ null, /*options=*/ {features: 'noopener'});
  for (let i = 0; i < 1; i++) {
    await rc.executeScript(() => { window.bfbBlock = new Array(128 * 1024).fill(1.5); });
    
    rc = await rc.navigateToNew();
  }
  assert_true(!!rc);
}, 'navigated 1 time(s)');
