// META: title=WebCrypto derived dictionaries preserve repeatable name getters
// The pinned upstream helper transfers twice and throws. Current WPT guards
// the transfer; a second read remains required by Firefox/Safari and §18.4.4.
promise_test(async () => {
  const key = await crypto.subtle.importKey('raw', new Uint8Array(16),
    'AES-GCM', false, ['encrypt', 'decrypt']);
  const data = new Uint8Array([1, 2, 3]);
  let reads = 0;
  const encrypted = await crypto.subtle.encrypt({
    get name() {
      ++reads;
      if (!data.buffer.detached) data.buffer.transfer();
      return 'AES-GCM';
    },
    iv: new Uint8Array(12)
  }, key, data);
  assert_equals(reads, 2, 'Derived dictionary converts inherited name again');
  assert_equals(encrypted.byteLength, 16, 'Empty plaintext yields only a tag');
  const decrypted = await crypto.subtle.decrypt(
    {name: 'AES-GCM', iv: new Uint8Array(12)}, key, encrypted);
  assert_equals(decrypted.byteLength, 0);
}, 'Guarded transfer observes the copied empty plaintext');
