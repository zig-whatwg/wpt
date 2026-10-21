for (const C of [Event, CustomEvent, MessageEvent]) {
  test(() => {
    const first = new C('x');
    const second = new C('y');
    const d = Object.getOwnPropertyDescriptor(first, 'isTrusted');
    assert_not_equals(d, undefined);
    assert_equals(typeof d.get, 'function');
    assert_equals(d.set, undefined);
    assert_true(d.enumerable);
    assert_false(d.configurable);
    assert_equals(d.get, Object.getOwnPropertyDescriptor(second, 'isTrusted').get);
    assert_false(first.isTrusted);
    assert_false(Reflect.deleteProperty(first, 'isTrusted'));
    assert_false(Reflect.defineProperty(first, 'isTrusted', {value: true}));
    assert_false(Reflect.set(first, 'isTrusted', true));
    assert_false(Object.hasOwn(C.prototype, 'isTrusted'));
    assert_throws_js(TypeError, () => d.get.call({}));
  }, `${C.name} inherits a non-configurable own isTrusted accessor`);
}
