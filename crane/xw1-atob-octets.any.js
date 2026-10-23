// META: global=window,worker

test(() => {
  const octets = String.fromCharCode(...Array.from({length:256}, (_,i)=>i));
  assert_equals(atob(btoa(octets)), octets);
}, 'atob returns each decoded byte as one code unit');
