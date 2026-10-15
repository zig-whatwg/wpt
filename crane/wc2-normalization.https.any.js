// META: title=WebCrypto normalization follows browser dictionary conversion

for (const hash of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
  promise_test(async () => {
    let reads = 0;
    const data = new Uint8Array([7, 8, 9]);
    const result = await crypto.subtle.digest({get name() {
      ++reads;
      data.buffer.transfer();
      return hash;
    }}, data);
    assert_equals(reads, 1);
    assert_array_equals(new Uint8Array(result), new Uint8Array(
      await crypto.subtle.digest(hash, new Uint8Array())));
  }, `${hash} reads name once before copying detached input`);
}

promise_test(async () => {
  const key = await crypto.subtle.importKey("raw", new Uint8Array([1]),
    {name: "HMAC", hash: "SHA-256"}, false, ["sign", "verify"]);
  const message = new Uint8Array([42]);
  let reads = 0;
  const signature = await crypto.subtle.sign({get name() {
    ++reads;
    message.buffer.transfer();
    return "HMAC";
  }}, key, message);
  assert_equals(reads, 1);
  assert_true(await crypto.subtle.verify("HMAC", key, signature, new Uint8Array()));
  let verifyReads = 0;
  assert_false(await crypto.subtle.verify({get name() {
    ++verifyReads;
    signature.transfer();
    return "HMAC";
  }}, key, signature, new Uint8Array()));
  assert_equals(verifyReads, 1);
}, "HMAC sign and verify read plain Algorithm.name once");

promise_test(async () => {
  const key = await crypto.subtle.importKey("raw", new Uint8Array(16), "AES-GCM", false, ["encrypt"]);
  const seen = [];
  const result = await crypto.subtle.encrypt({
    get name() { seen.push("name"); return "AES-GCM"; },
    get additionalData() { seen.push("additionalData"); return new Uint8Array(); },
    get iv() { seen.push("iv"); return new Uint8Array(12); },
    get tagLength() { seen.push("tagLength"); return 128; }
  }, key, new Uint8Array());
  assert_array_equals(seen, ["name", "name", "additionalData", "iv", "tagLength"]);
  assert_equals(result.byteLength, 16);
}, "AesGcmParams keeps the majority-browser second inherited name read");

promise_test(async t => {
  const key = await crypto.subtle.importKey("raw", new Uint8Array(16), "AES-GCM", false, ["encrypt"]);
  let reads = 0;
  const sentinel = {secondRead: true};
  await promise_rejects_exactly(t, sentinel, crypto.subtle.encrypt({
    get name() { if (++reads === 2) throw sentinel; return "AES-GCM"; },
    get iv() { assert_unreached("second name exception precedes iv"); }
  }, key, new Uint8Array()));
  assert_equals(reads, 2);
}, "Derived dictionary conversion preserves second-name exception precedence");
