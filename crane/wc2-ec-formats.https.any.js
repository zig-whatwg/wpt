// META: title=EC canonical private exports and compressed point validation
// META: script=/WebCryptoAPI/util/ec_key_fixtures.js

for (const name of ["ECDSA", "ECDH"]) {
  const privateUsages = name === "ECDSA" ? ["sign"] : ["deriveBits"];
  const publicUsages = name === "ECDSA" ? ["verify"] : [];
  for (const namedCurve of ["P-256", "P-384", "P-521"]) {
    const data = ecKeyData[namedCurve];
    const algorithm = {name, namedCurve};
    for (const source of ["pkcs8", "pkcs8_private_only"]) {
      promise_test(async () => {
        const key = await crypto.subtle.importKey("pkcs8", data[source], algorithm, true, privateUsages);
        assert_array_equals(new Uint8Array(await crypto.subtle.exportKey("pkcs8", key)), data.pkcs8);
        const jwk = await crypto.subtle.exportKey("jwk", key);
        for (const member of ["crv", "x", "y", "d"]) assert_equals(jwk[member], data.jwk[member]);
      }, `${name} ${namedCurve} canonical export from ${source}`);
    }
    for (const format of ["raw", "spki"]) {
      promise_test(async () => {
        const key = await crypto.subtle.importKey(format, data[`${format}_compressed`], algorithm, true, publicUsages);
        assert_array_equals(new Uint8Array(await crypto.subtle.exportKey("raw", key)), data.raw);
      }, `${name} ${namedCurve} compressed ${format} import`);
    }
    promise_test(async t => {
      const otherCurve = namedCurve === "P-256" ? "P-384" : "P-256";
      await promise_rejects_dom(t, "DataError", crypto.subtle.importKey("spki", data.spki_compressed,
        {name, namedCurve: otherCurve}, true, publicUsages));
    }, `${name} ${namedCurve} rejects a different compressed SPKI curve`);
  }
  for (const parity of [2, 3]) {
    promise_test(async t => {
      const point = new Uint8Array(67);
      point[0] = parity;
      point[66] = 3; // x^3 - 3x + b is a quadratic non-residue for x = 3.
      await promise_rejects_dom(t, "DataError", crypto.subtle.importKey("raw", point,
        {name, namedCurve: "P-521"}, true, publicUsages));
      point.fill(255, 1);
      point[1] = 1; // x = p must not be reduced to zero.
      await promise_rejects_dom(t, "DataError", crypto.subtle.importKey("raw", point,
        {name, namedCurve: "P-521"}, true, publicUsages));
    }, `${name} rejects invalid P-521 compressed coordinates with parity ${parity}`);
  }
}
