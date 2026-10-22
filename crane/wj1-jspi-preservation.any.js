// META: global=window,worker
// META: script=/wasm/jsapi/wasm-module-builder.js
function makeWj1(fn) {
  const b = new WasmModuleBuilder();
  const i = b.addImport('m', 'f', kSig_i_ii);
  b.addGlobal(kWasmI32, true).exportAs('g');
  b.addFunction('f', kSig_i_ii).addBody([
    kExprLocalGet, 0, kExprLocalGet, 1, kExprCallFunction, i,
    kExprGlobalSet, 0, kExprGlobalGet, 0]).exportFunc();
  return b.instantiate({m:{f:fn}});
}
promise_test(async () => {
  let calls = 0;
  const original = function(a,b) {
    'use strict';
    assert_equals(this, undefined);
    assert_array_equals(Array.from(arguments), [7,8]);
    calls++;
    return a+b;
  };
  const marker = new WebAssembly.Suspending(original);
  const instance = makeWj1(marker);
  const p = WebAssembly.promising(instance.exports.f)(7,8);
  assert_equals(instance.exports.g.value, 0);
  assert_equals(await p, 15);
  assert_equals(await WebAssembly.promising(makeWj1(marker).exports.f)(7,8), 15);
  assert_equals(calls, 2);
}, 'JSPI normal completion suspends while retaining receiver, arguments and marker identity');
promise_test(async t => {
  const p = Promise.resolve(23);
  Object.defineProperty(p, 'then', {get() { throw Error('same promise assimilated'); }});
  assert_equals(await WebAssembly.promising(makeWj1(new WebAssembly.Suspending(() => p)).exports.f)(0,0), 23);
  const sentinel = {};
  const throwing = makeWj1(new WebAssembly.Suspending(() => {throw sentinel;}));
  await promise_rejects_exactly(t, sentinel, WebAssembly.promising(throwing.exports.f)(0,0));
}, 'JSPI preserves an existing Promise and synchronous exception identity');
promise_test(async t => {
  const savedPromise = Promise;
  const savedResolve = Promise.resolve;
  const marker = new WebAssembly.Suspending(() => 29);
  t.add_cleanup(() => {globalThis.Promise = savedPromise; savedPromise.resolve = savedResolve;});
  let result;
  try {
    savedPromise.resolve = () => {throw Error('mutable resolve');};
    globalThis.Promise = function() {throw Error('mutable Promise');};
    result = WebAssembly.promising(makeWj1(marker).exports.f)(0,0);
  } finally {
    globalThis.Promise = savedPromise;
    savedPromise.resolve = savedResolve;
  }
  assert_equals(await result, 29);
}, 'JSPI uses captured Promise intrinsics after globals are changed');
test(() => {
  const ctor = WebAssembly.Suspending;
  const d = Object.getOwnPropertyDescriptor(WebAssembly, 'Suspending');
  assert_equals(ctor.prototype.constructor, ctor);
  assert_equals(ctor.name, 'Suspending');
  assert_equals(ctor.length, 1);
  assert_true(d.writable && d.configurable && !d.enumerable);
  assert_throws_js(TypeError, () => ctor(() => {}));
}, 'Suspending retains its native interface-object shape');
