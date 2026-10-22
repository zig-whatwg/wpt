// META: global=window,worker
for (const name of ['Memory', 'Table']) {
  test(() => {
    const descriptor = {address: 'i32', element: 'anyfunc'};
    Object.defineProperty(descriptor, 'initial', {get() {
      assert_equals(this, descriptor, 'dictionary getter receiver');
      return 0;
    }});
    Object.defineProperty(descriptor, 'index', {value: 'not-a-dictionary-member'});
    new WebAssembly[name](descriptor);
  }, name + ' descriptor getters receive the original dictionary');
}
