// META: global=window,worker
// WebIDL PR 1498: a missing attribute-setter argument becomes undefined.
const descriptor = Object.getOwnPropertyDescriptor(WebAssembly.Global.prototype, 'value');
const setter = descriptor.set;
for (const type of ['i32', 'f32', 'f64', 'externref']) {
  test(() => {
    const global = new WebAssembly.Global({value: type, mutable: true});
    setter.call(global);
    const omitted = global.value;
    setter.call(global, undefined);
    assert_true(Object.is(global.value, omitted));
  }, 'Global.value omitted argument equals undefined for ' + type);
}
test(() => {
  assert_equals(setter.name, 'set value');
  assert_equals(setter.length, 1);
  assert_true(descriptor.enumerable);
  assert_true(descriptor.configurable);
  assert_throws_js(TypeError, () => new setter());
}, 'Global.value setter preserves its descriptor and is not constructible');
test(() => {
  assert_throws_js(TypeError, () => setter.call({}));
  assert_throws_js(TypeError, () => setter.call(new WebAssembly.Global({value: 'i32'})));
}, 'Global.value setter retains branding and immutable-global rejection');
test(() => {
  const global = new WebAssembly.Global({value: 'i64', mutable: true});
  assert_throws_js(TypeError, () => setter.call(global));
  setter.call(global, 42n);
  assert_equals(global.value, 42n);
}, 'Global.value setter retains BigInt conversion');
test(() => {
  const sentinel = {};
  const global = new WebAssembly.Global({value: 'i32', mutable: true});
  assert_throws_exactly(sentinel, () => setter.call(global, {valueOf() { throw sentinel; }}));
}, 'Global.value setter propagates conversion exceptions unchanged');
