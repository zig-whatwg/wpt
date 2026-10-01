// META: global=window,dedicatedworker
// META: title=A blob URL holds its blob after script lets go of the Blob
//
// File API "blob URL entry": its object is the Blob, and URL.createObjectURL
// adds the entry to the blob URL store, which keeps it until it is revoked
// (or its environment goes). Script routinely keeps only the URL -
// URL.createObjectURL(new Blob([...])) - so the Blob object is garbage at
// once, but its URL must go on resolving: fetch and import() obtain the blob
// from the entry, not from the object script made.
//
// Crane's store kept a bare pointer to the Blob's data, which the Blob freed
// when the collector freed it: html/semantics/scripting-1/the-script-element/
// module/dynamic-import/blob-url.any.js died in fetch_body.resolveBlobURL
// (Allocator.dupe of freed memory) under a worker's import() once a sweep's
// earlier files had grown the heap enough for a collection to fall between
// createObjectURL and the fetch.

function collect() {
  if (self.TestUtils && TestUtils.gc) return TestUtils.gc();
  let junk = [];
  for (let i = 0; i < 300000; i++) junk.push({ i, s: "x" + i });
  junk = null;
  return Promise.resolve();
}

async function collectTwice() {
  await collect();
  await collect();
}

// Blobs of other contents, kept, so a freed slot is likely to be reissued.
function churn() {
  const keep = [];
  for (let i = 0; i < 200; i++) keep.push(new Blob(["churn " + i + " ".repeat(i)], { type: "application/x-churn" }));
  return keep;
}

// The URL of a Blob nothing else refers to.
function urlOfDroppedBlob(text, type) {
  return URL.createObjectURL(new Blob([text], { type }));
}

promise_test(async t => {
  const url = urlOfDroppedBlob("the blob's bytes", "text/plain");
  t.add_cleanup(() => URL.revokeObjectURL(url));
  await collectTwice();
  const kept = churn();
  const response = await fetch(url);
  assert_equals(response.headers.get("Content-Type"), "text/plain");
  assert_equals(await response.text(), "the blob's bytes");
  assert_equals(kept.length, 200);
}, "fetch() of a blob URL whose Blob was collected reads the blob");

promise_test(async t => {
  const url = urlOfDroppedBlob('export const foo = "bar";', "text/javascript");
  t.add_cleanup(() => URL.revokeObjectURL(url));
  await collectTwice();
  const kept = churn();
  const module = await import(url);
  assert_equals(module.foo, "bar");
  assert_equals(kept.length, 200);
}, "import() of a blob URL whose Blob was collected loads the module");

promise_test(async t => {
  const urls = [];
  for (let i = 0; i < 40; i++) urls.push(urlOfDroppedBlob("blob number " + i, "text/plain"));
  t.add_cleanup(() => urls.forEach(url => URL.revokeObjectURL(url)));
  await collectTwice();
  const kept = churn();
  for (let i = 0; i < urls.length; i++) {
    const response = await fetch(urls[i]);
    assert_equals(await response.text(), "blob number " + i, `URL ${i}`);
  }
  assert_equals(kept.length, 200);
}, "forty blob URLs whose Blobs were collected each read their own blob");

promise_test(async t => {
  const url = urlOfDroppedBlob("revoked", "text/plain");
  await collectTwice();
  URL.revokeObjectURL(url);
  await promise_rejects_js(t, TypeError, fetch(url));
}, "a revoked blob URL whose Blob was collected is a network error");
