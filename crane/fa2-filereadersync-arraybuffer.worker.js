importScripts('/resources/testharness.js');
test(() => {
  const result = new FileReaderSync().readAsArrayBuffer(new Blob(['hello']));
  assert_true(result instanceof ArrayBuffer);
  assert_array_equals(new Uint8Array(result), [104, 101, 108, 108, 111]);
}, 'FileReaderSync readAsArrayBuffer returns the Blob bytes');
done();
