// META: global=window,dedicatedworker,sharedworker

promise_test(async () => {
  let blob = new Blob(['retained request body'], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  let original = new Request(url);
  const clone = original.clone();
  original = null;
  blob = null;
  URL.revokeObjectURL(url);
  TestUtils.gc();
  const response = await fetch(clone);
  assert_equals(await response.text(), 'retained request body');
}, 'A Request clone keeps its parsed blob entry after revoke and collection');

promise_test(async () => {
  let blob = new Blob(['retained XHR body'], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  URL.revokeObjectURL(url);
  blob = null;
  TestUtils.gc();
  const loaded = new Promise((resolve,reject) => {
    xhr.onload = resolve;
    xhr.onerror = () => reject(new Error('Captured blob URL failed at send'));
  });
  xhr.send();
  await loaded;
  assert_equals(xhr.status, 200);
  assert_equals(xhr.responseText, 'retained XHR body');
}, 'XMLHttpRequest.open keeps its parsed blob entry until send after revoke and collection');

promise_test(async () => {
  const url = URL.createObjectURL(new Blob(['already fetching']));
  const pending = fetch(url);
  URL.revokeObjectURL(url);
  TestUtils.gc();
  assert_equals(await (await pending).text(), 'already fetching');
}, 'fetch captures its blob URL before returning to the caller');
