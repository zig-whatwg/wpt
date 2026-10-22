// META: global=window,worker
const wj1ShapeBytes = new Uint8Array([0,97,115,109,1,0,0,0]);
const wj1ShapeModule = new WebAssembly.Module(wj1ShapeBytes);
const wj1ShapeTag = new WebAssembly.Tag({parameters:[]});
for (const [name,args] of [
  ['Module',[wj1ShapeBytes]], ['Instance',[wj1ShapeModule]],
  ['Memory',[{initial:0}]], ['Table',[{element:'externref',initial:0}]],
  ['Global',[{value:'i32'},42]], ['Exception',[wj1ShapeTag,[]]],
]) {
  test(() => {
    const C = WebAssembly[name];
    assert_equals(C.name,name);
    assert_equals(C.length,1);
    assert_equals(Object.getPrototypeOf(C),Function.prototype);
    assert_true(Function.prototype.toString.call(C).includes('[native code]'));
    for (const key of ['name','length','prototype']) {
      const d = Object.getOwnPropertyDescriptor(C,key);
      assert_false(d.writable,key + ' writable');
      assert_false(d.enumerable,key + ' enumerable');
      assert_equals(d.configurable,key !== 'prototype',key + ' configurable');
    }
    assert_equals(C.prototype.constructor,C);
    assert_false(Object.hasOwn(C,Symbol.hasInstance));
    assert_throws_js(TypeError,() => Reflect.apply(C,undefined,args));
  },name + ' preserves the native constructor shape');
  test(() => {
    const C = WebAssembly[name];
    const made = Reflect.construct(C,args);
    const bound = C.bind(undefined);
    const twice = bound.bind(undefined);
    assert_true(made instanceof C);
    assert_true(made instanceof bound);
    assert_true(made instanceof twice);
    assert_true(Function.prototype[Symbol.hasInstance].call(C,made));
    assert_true(Function.prototype[Symbol.hasInstance].call(C,Object.create(C.prototype)));
    assert_false(Function.prototype[Symbol.hasInstance].call(C,{}));
    assert_false(Function.prototype[Symbol.hasInstance].call(C,null));
    assert_equals(Object.getPrototypeOf(Reflect.construct(twice,args)),C.prototype);
    assert_equals(Object.getPrototypeOf(Reflect.construct(C,args,twice)),C.prototype);
    class X extends C { constructor() { super(...args); } }
    const child = new X();
    assert_true(child instanceof X);
    assert_true(child instanceof C);
    assert_equals(Object.getPrototypeOf(child),X.prototype);
  },name + ' preserves instanceof, bound construction and subclasses');
  test(t => {
    const C = WebAssembly[name];
    const made = Reflect.construct(C,args);
    const bound = C.bind(undefined);
    Object.defineProperty(C,Symbol.hasInstance,{configurable:true,value:() => false});
    t.add_cleanup(() => { delete C[Symbol.hasInstance]; });
    assert_false(made instanceof C);
    assert_false(made instanceof bound);
    assert_true(Function.prototype[Symbol.hasInstance].call(C,made));
  },name + ' allows a user-defined Symbol.hasInstance');
}
