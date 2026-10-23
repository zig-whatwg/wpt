// META: global=window,worker

const octets = String.fromCharCode(...Array.from({length: 128}, (_, i) => i + 128));

test(() => {
  const headers = new Headers([['x-octets', octets]]);
  assert_equals(headers.get('x-octets'), octets);
  assert_equals(headers.get('missing'), null);
}, 'Nullable ByteString operation results preserve every byte as its code unit');

test(() => {
  assert_equals(new Response('', {statusText: octets}).statusText, octets);
}, 'ByteString attribute results preserve every byte as its code unit');

test(() => {
  const params = new URLSearchParams([['value', '\u00e9\u20ac']]);
  assert_equals(params.get('value'), '\u00e9\u20ac');
}, 'USVString operation results continue to decode their UTF-8 representation');
