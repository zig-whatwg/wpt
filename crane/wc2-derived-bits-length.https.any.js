// META: title=deriveBits safe length vectors and browser range conversion
// META: script=/WebCryptoAPI/util/helpers.js
// META: script=/WebCryptoAPI/derive_bits_keys/derived_bits_length.js
// META: script=/WebCryptoAPI/derive_bits_keys/derived_bits_length_vectors.js
// META: script=/WebCryptoAPI/derive_bits_keys/derived_bits_length_testcases.js

// Exercise ordinary operation vectors. Test range conversion separately with
// HKDF: wrapping -8 otherwise asks PBKDF2 for nearly 512 MiB at 100,000 rounds.
for (const name of Object.keys(testCases)) {
  testCases[name] = testCases[name].filter(p => !enforceRangeTestCases.includes(p));
}
define_tests();

// Browser deviation from current WebCrypto §14.2's [EnforceRange]: Chrome
// and Safari still convert modulo 2^32. Aligned wpt.fyi runs 6218298311311360
// and 5164107446878208 fail all four new HKDF range assertions in exactly
// this way; Firefox enforces the range. Never exercise the huge PBKDF2 case.
for (const [length, byteLength] of [[NaN, 0], [Infinity, 0], [2 ** 32 + 8, 1]]) {
  promise_test(async () => {
    const key = await crypto.subtle.importKey("raw", new Uint8Array([1]), "HKDF", false, ["deriveBits"]);
    const algorithm = {name: "HKDF", salt: new Uint8Array(), info: new Uint8Array(), hash: "SHA-256"};
    assert_equals((await crypto.subtle.deriveBits(algorithm, key, length)).byteLength, byteLength);
  }, `deriveBits converts ${length} as the browser majority does`);
}
promise_test(async t => {
  const key = await crypto.subtle.importKey("raw", new Uint8Array([1]), "HKDF", false, ["deriveBits"]);
  const algorithm = {name: "HKDF", salt: new Uint8Array(), info: new Uint8Array(), hash: "SHA-256"};
  await promise_rejects_dom(t, "OperationError", crypto.subtle.deriveBits(algorithm, key, -8));
}, "Wrapped negative length exceeds HKDF's output bound without a giant derivation");
