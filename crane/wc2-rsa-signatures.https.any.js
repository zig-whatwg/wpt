// META: title=RSA PKCS1 verification resolves false for invalid representatives
// META: script=/WebCryptoAPI/util/rsa_key_fixtures.js
// META: script=/WebCryptoAPI/sign_verify/rsa_pkcs_vectors.js

for (const vector of getTestVectors()) {
  promise_test(async () => {
    const algorithm = {name: "RSASSA-PKCS1-v1_5", hash: vector.hash};
    const key = await crypto.subtle.importKey(vector.publicKeyFormat, vector.publicKeyBuffer,
      algorithm, false, ["verify"]);
    assert_true(await crypto.subtle.verify(algorithm.name, key, vector.signature, vector.plaintext));
    const altered = new Uint8Array(vector.signature);
    altered[0] = 255 - altered[0];
    assert_false(await crypto.subtle.verify(algorithm.name, key, altered, vector.plaintext));
    altered.fill(255);
    assert_false(await crypto.subtle.verify(algorithm.name, key, altered, vector.plaintext));
    altered.fill(0);
    assert_false(await crypto.subtle.verify(algorithm.name, key, altered, vector.plaintext));
    assert_false(await crypto.subtle.verify(algorithm.name, key, altered.subarray(1), vector.plaintext));
  }, `${vector.hash} rejects altered, out-of-range, zero and short RSA signatures`);
}
