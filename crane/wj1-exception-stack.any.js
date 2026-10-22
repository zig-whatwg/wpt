// META: global=window,worker
// META: script=/wasm/jsapi/wasm-module-builder.js
test(() => {
  const d = Object.getOwnPropertyDescriptor(WebAssembly.Exception.prototype,'stack');
  assert_true(!!d, 'prototype stack property');
  assert_true(d.enumerable);
  assert_true(d.configurable);
  assert_equals(d.set, undefined);
  assert_equals(d.get.name, 'get stack');
  assert_equals(d.get.length, 0);
  assert_throws_js(TypeError, () => new d.get());
  for (const r of [{}, Object.create(WebAssembly.Exception.prototype), undefined, new Error()])
    assert_throws_js(TypeError, () => d.get.call(r));
}, 'Exception.stack is an enumerable branded nonconstructible prototype getter');
test(() => {
  const tag = new WebAssembly.Tag({parameters:[]});
  const plain = new WebAssembly.Exception(tag, []);
  assert_false(Object.hasOwn(plain, 'stack'));
  assert_equals(plain.stack, undefined);
  let reads = 0;
  const traced = new WebAssembly.Exception(tag, [], {get traceStack() { reads++; return true; }});
  assert_equals(reads, 1);
  assert_false(Object.hasOwn(traced, 'stack'));
  const get = Object.getOwnPropertyDescriptor(WebAssembly.Exception.prototype,'stack').get;
  const stack = get.call(traced);
  assert_true(stack === undefined || typeof stack === 'string');
  Object.defineProperty(traced, 'stack', {value:'replacement', configurable:true});
  assert_equals(get.call(traced), stack);
  const sentinel = {};
  assert_throws_exactly(sentinel, () => new WebAssembly.Exception(tag, [], {get traceStack() {throw sentinel;}}));
}, 'Exception.stack retains constructor capture independently of mutable properties');
test(() => {
  const b = new WasmModuleBuilder();
  const tag = b.addTag(kSig_v_v);
  b.addFunction('throwIt',kSig_v_v).addBody([kExprThrow, tag]).exportFunc();
  const instance = b.instantiate();
  let caught;
  try {instance.exports.throwIt();} catch(e) {caught=e;}
  assert_true(caught instanceof WebAssembly.Exception);
  const get = Object.getOwnPropertyDescriptor(WebAssembly.Exception.prototype,'stack').get;
  assert_equals(get.call(caught), undefined);
}, 'A wasm-created Exception has an undefined stack');
