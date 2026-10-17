// META: global=window,dedicatedworker
// META: title=TextDecoder.decode() copies its input after the options convert
//
// WebIDL 3.2.25/3.2.26: an AllowSharedBufferSource argument is a reference to
// its object, and arguments convert in order - so decode(input, options)'s
// options dictionary converts after the input, and a getter on it can detach
// or alter the input's buffer. Encoding decode() step 3 then "push[es] a copy
// of input": a detached buffer holds no bytes, an altered one its new bytes.
// encoding/textdecoder-arguments.any.js covers a typed array detached by
// transfer(0); this covers the other member types and the other getters.
// Crane converted the input to a slice over its backing store, taken before
// the options converted, and decode() read the store the getter had freed.

function decodeWith(input, onStream) {
  return new TextDecoder().decode(input, { get stream() { onStream(); return false; } });
}

test(() => {
  const buffer = new Uint8Array(10000).fill(42).buffer;
  assert_equals(decodeWith(buffer, () => buffer.transfer(0)), '');
}, 'an ArrayBuffer detached by the options getter decodes to ""');

test(() => {
  const view = new DataView(new Uint8Array(10000).fill(42).buffer, 1, 3);
  assert_equals(decodeWith(view, () => view.buffer.transfer(0)), '');
}, 'a DataView whose buffer the options getter detaches decodes to ""');

test(() => {
  const view = new Uint16Array(5000).fill(0x2a2a);
  assert_equals(decodeWith(view, () => view.buffer.transfer()), '');
}, 'a typed array whose bytes the options getter transfers away decodes to ""');

test(() => {
  const view = new Uint8Array([104, 105]);
  assert_equals(decodeWith(view, () => { view[0] = 72; }), 'Hi');
}, 'decode() reads the input as the options getter left it');

test(() => {
  const decoder = new TextDecoder();
  assert_equals(decoder.decode(new Uint8Array([0xE2, 0x82]), { stream: true }), '');
  const view = new Uint8Array([0xAC]);
  assert_equals(decoder.decode(view, { get stream() { view.buffer.transfer(0); return false; } }), '�',
    'the pending bytes are flushed with nothing after them');
}, 'a detached input pushes nothing, and what an earlier call left pending is still decoded');
