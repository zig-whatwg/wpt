importScripts('/resources/testharness.js');
const reader = new FileReaderSync();
test(() => {
  const bytes = new Uint8Array([0, 0x7f, 0x80, 0xcf, 0x83, 0xff]);
  assert_array_equals(Array.from(reader.readAsBinaryString(new Blob([bytes])), c => c.charCodeAt(0)), Array.from(bytes));
}, 'FileReaderSync binary strings preserve each byte as one code unit');
test(() => {
  const blob = new Blob([new Uint8Array([0, 0x80, 0xff])]);
  const a = reader.readAsArrayBuffer(blob), b = reader.readAsArrayBuffer(blob);
  assert_true(a instanceof ArrayBuffer);
  assert_not_equals(a, b);
  new Uint8Array(a)[0] = 99;
  assert_array_equals(new Uint8Array(b), [0, 0x80, 0xff]);
}, 'FileReaderSync ArrayBuffers contain independent copies');
test(() => {
  assert_equals(reader.readAsDataURL(new Blob()), 'data:application/octet-stream;base64,');
  assert_equals(reader.readAsDataURL(new Blob(['x'], {type:'text/plain'})), 'data:text/plain;base64,eA==');
}, 'FileReaderSync DataURLs use the browser default media type');
test(() => {
  const latin = new Blob([new Uint8Array([0x80])], {type:'text/plain;charset=windows-1252'});
  assert_equals(reader.readAsText(latin), '€');
  assert_equals(reader.readAsText(latin, 'invalid-label'), '€');
  assert_equals(reader.readAsText(latin, 'utf-8'), '�');
  const bom = new Blob([new Uint8Array([0xff, 0xfe, 0x41, 0])]);
  assert_equals(reader.readAsText(bom, 'windows-1252'), 'A');
}, 'FileReaderSync text uses label, MIME fallback and BOM precedence');
done();
