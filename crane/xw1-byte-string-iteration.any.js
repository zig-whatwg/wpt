// META: global=window,worker

test(() => {
  const bytes = String.fromCharCode(...Array.from({length:128}, (_,i)=>i+128));
  const h = new Headers({test:bytes});
  assert_equals(h.get('test'), bytes);
  assert_equals([...h.values()][0], bytes);
  assert_equals([...h.entries()][0][1], bytes);
  h.forEach(v => assert_equals(v,bytes));
  const c = new Headers({'set-cookie':bytes});
  assert_array_equals(c.getSetCookie(), [bytes]);
}, 'Every Headers path returns each ByteString octet as one code unit');

test(() => {
  const text = '\u20ac\ud83d\ude00';
  const params = new URLSearchParams({test:text});
  assert_equals([...params][0][1],text);
  const form = new FormData();
  form.set('test',text);
  assert_equals([...form][0][1],text);
}, 'USVString pair iterables retain Unicode code points');
